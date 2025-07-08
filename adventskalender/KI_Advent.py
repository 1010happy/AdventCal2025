import dash
from dash import dcc, html, Input, Output, State, callback_context
import plotly.graph_objects as go
import plotly.express as px
import numpy as np
import pandas as pd
import time
import threading
import queue
from collections import deque
import random

# Globale Variablen für den Spielzustand
class GameState:
    def __init__(self):
        self.reset()
        self.q_table = {}
        self.episode_rewards = deque(maxlen=50)
        self.is_running = False
        self.game_thread = None
        self.update_queue = queue.Queue()
        
    def reset(self):
        self.grid_size = 5
        self.robot_pos = [0, 0]
        self.goal_pos = [4, 4]
        self.obstacles = [[1, 1], [2, 2], [3, 1], [1, 3]]
        self.episode = 0
        self.total_reward = 0
        self.step_count = 0
        self.epsilon = 0.5
        self.reward_function = 'standard'
        self.last_action = None
        self.last_reward = 0
        self.max_steps = 50

# Globaler Spielzustand
game_state = GameState()

# Reward-Funktionen
REWARD_FUNCTIONS = {
    'standard': {
        'name': 'Standard',
        'description': 'Ziel: +100, Kollision: -50, Schritt: -1',
        'rewards': {'goal': 100, 'collision': -50, 'step': -1}
    },
    'efficient': {
        'name': 'Effizienz',
        'description': 'Ziel: +200, Kollision: -100, Schritt: -2',
        'rewards': {'goal': 200, 'collision': -100, 'step': -2}
    },
    'safe': {
        'name': 'Sicherheit',
        'description': 'Ziel: +50, Kollision: -200, Schritt: -0.5',
        'rewards': {'goal': 50, 'collision': -200, 'step': -0.5}
    },
    'curious': {
        'name': 'Neugierig',
        'description': 'Ziel: +100, Kollision: -20, Schritt: +0.5',
        'rewards': {'goal': 100, 'collision': -20, 'step': 0.5}
    }
}

# RL-Funktionen
def pos_to_state(pos, grid_size):
    return pos[0] * grid_size + pos[1]

def is_valid_pos(pos, grid_size):
    return 0 <= pos[0] < grid_size and 0 <= pos[1] < grid_size

def is_obstacle(pos, obstacles):
    return any(obs[0] == pos[0] and obs[1] == pos[1] for obs in obstacles)

def get_reward(new_pos, goal_pos, obstacles, reward_function):
    rewards = REWARD_FUNCTIONS[reward_function]['rewards']
    
    if new_pos[0] == goal_pos[0] and new_pos[1] == goal_pos[1]:
        return rewards['goal']
    if is_obstacle(new_pos, obstacles):
        return rewards['collision']
    return rewards['step']

def get_q_value(state, action, q_table):
    key = f"{state}-{action}"
    return q_table.get(key, 0)

def update_q_value(state, action, reward, next_state, q_table, alpha=0.1, gamma=0.9):
    key = f"{state}-{action}"
    current_q = get_q_value(state, action, q_table)
    max_next_q = max([get_q_value(next_state, a, q_table) for a in range(4)])
    new_q = current_q + alpha * (reward + gamma * max_next_q - current_q)
    q_table[key] = new_q

def choose_action(state, epsilon, q_table):
    if random.random() < epsilon:
        return random.randint(0, 3)  # Exploration
    else:
        q_values = [get_q_value(state, action, q_table) for action in range(4)]
        return q_values.index(max(q_values))  # Exploitation

def move_robot(action, robot_pos, goal_pos, obstacles, grid_size, reward_function):
    directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]  # up, down, left, right
    dx, dy = directions[action]
    new_pos = [robot_pos[0] + dx, robot_pos[1] + dy]
    
    if not is_valid_pos(new_pos, grid_size):
        return {'moved': False, 'reward': -5, 'done': False, 'new_pos': robot_pos}
    
    reward = get_reward(new_pos, goal_pos, obstacles, reward_function)
    done = (new_pos == goal_pos) or is_obstacle(new_pos, obstacles)
    
    if not is_obstacle(new_pos, obstacles):
        return {'moved': True, 'reward': reward, 'done': done, 'new_pos': new_pos}
    else:
        return {'moved': False, 'reward': reward, 'done': done, 'new_pos': robot_pos}

# Game-Loop Thread
def game_loop():
    while game_state.is_running:
        if game_state.step_count >= game_state.max_steps:
            # Episode beendet - Reset
            game_state.episode_rewards.append(game_state.total_reward)
            game_state.robot_pos = [0, 0]
            game_state.total_reward = 0
            game_state.step_count = 0
            game_state.episode += 1
            game_state.last_action = None
            game_state.last_reward = 0
            time.sleep(1)
            continue
            
        # Game Step
        current_state = pos_to_state(game_state.robot_pos, game_state.grid_size)
        action = choose_action(current_state, game_state.epsilon, game_state.q_table)
        
        result = move_robot(
            action, 
            game_state.robot_pos, 
            game_state.goal_pos, 
            game_state.obstacles, 
            game_state.grid_size, 
            game_state.reward_function
        )
        
        game_state.last_action = action
        game_state.last_reward = result['reward']
        game_state.total_reward += result['reward']
        game_state.step_count += 1
        game_state.robot_pos = result['new_pos']
        
        # Q-Learning Update
        next_state = pos_to_state(game_state.robot_pos, game_state.grid_size)
        update_q_value(current_state, action, result['reward'], next_state, game_state.q_table)
        
        if result['done']:
            game_state.episode_rewards.append(game_state.total_reward)
            game_state.robot_pos = [0, 0]
            game_state.total_reward = 0
            game_state.step_count = 0
            game_state.episode += 1
            time.sleep(1)
        
        time.sleep(0.4)  # Geschwindigkeit anpassen

# Dash App erstellen
app = dash.Dash(__name__)

# Layout
app.layout = html.Div([
    # Header
    html.Div([
        html.H1("🏭 Fabrik-Roboter Reinforcement Learning Demo", 
                className="text-3xl font-bold text-center mb-2"),
        html.P("Erlebe wie KI durch Exploration und Exploitation lernt!", 
               className="text-center text-gray-600 mb-6")
    ]),
    
    # Main Content
    html.Div([
        # Linke Spalte - Spielfeld
        html.Div([
            html.H2("🎮 Fabrik-Layout", className="text-xl font-semibold mb-4"),
            
            # Grid
            dcc.Graph(id='game-grid', style={'height': '400px'}),
            
            # Kontrollen
            html.Div([
                html.Button('▶️ Start', id='play-pause-btn', 
                           className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2'),
                html.Button('🔄 Reset', id='reset-btn',
                           className='bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded')
            ], className='mb-4'),
            
            html.P("🤖 = Roboter | 🎯 = Ziel | 🚛 = Andere Fahrzeuge | 🏠 = Start",
                   className="text-sm text-gray-600")
        ], className='w-1/2 pr-4'),
        
        # Rechte Spalte - Kontrollen
        html.Div([
            # RL Parameter
            html.Div([
                html.H2("⚙️ KI-Parameter", className="text-xl font-semibold mb-4"),
                
                # Epsilon Slider
                html.Div([
                    html.Label(id='epsilon-label', className='block text-sm font-medium mb-2'),
                    dcc.Slider(
                        id='epsilon-slider',
                        min=0, max=1, step=0.05, value=0.5,
                        marks={0: '0%', 0.5: '50%', 1: '100%'},
                        tooltip={"placement": "bottom", "always_visible": True}
                    ),
                    html.Div([
                        html.Span("100% Exploitation", className="text-xs"),
                        html.Span("100% Exploration", className="text-xs float-right")
                    ])
                ], className='mb-6'),
                
                # Reward Function Dropdown
                html.Div([
                    html.Label("Belohnungsfunktion:", className='block text-sm font-medium mb-2'),
                    dcc.Dropdown(
                        id='reward-function-dropdown',
                        options=[{'label': v['name'], 'value': k} for k, v in REWARD_FUNCTIONS.items()],
                        value='standard'
                    ),
                    html.P(id='reward-description', className="text-xs text-gray-500 mt-1")
                ], className='mb-4')
            ], className='bg-gray-50 p-4 rounded mb-6'),
            
            # Statistiken
            html.Div([
                html.H2("📊 Live-Statistiken", className="text-xl font-semibold mb-4"),
                
                html.Div([
                    html.Div([
                        html.Div(id='episode-display', className="text-lg font-bold text-blue-600"),
                        html.Div("Episode", className="text-sm text-gray-600")
                    ], className='bg-white p-3 rounded border'),
                    
                    html.Div([
                        html.Div(id='step-display', className="text-lg font-bold text-green-600"),
                        html.Div("Schritte", className="text-sm text-gray-600")
                    ], className='bg-white p-3 rounded border'),
                    
                    html.Div([
                        html.Div(id='reward-display', className="text-lg font-bold text-purple-600"),
                        html.Div("Belohnung", className="text-sm text-gray-600")
                    ], className='bg-white p-3 rounded border'),
                    
                    html.Div([
                        html.Div(id='avg-reward-display', className="text-lg font-bold text-orange-600"),
                        html.Div("Ø letzte 10", className="text-sm text-gray-600")
                    ], className='bg-white p-3 rounded border')
                ], className='grid grid-cols-2 gap-4 mb-4'),
                
                html.Div(id='last-action-info', className='bg-white p-3 rounded border')
            ], className='bg-gray-50 p-4 rounded mb-6'),
            
            # Performance Graph
            html.Div([
                html.H2("📈 Lernfortschritt", className="text-xl font-semibold mb-4"),
                dcc.Graph(id='performance-graph', style={'height': '200px'}),
                html.P("Zeigt die Belohnung pro Episode (höher = besser)",
                       className="text-xs text-gray-500")
            ], className='bg-gray-50 p-4 rounded')
        ], className='w-1/2 pl-4')
    ], className='flex'),
    
    # Update Interval
    dcc.Interval(id='interval-component', interval=500, n_intervals=0),
    
    # Hidden div to store game state
    html.Div(id='game-state', style={'display': 'none'})
])

# Callbacks
@app.callback(
    [Output('epsilon-label', 'children')],
    [Input('epsilon-slider', 'value')]
)
def update_epsilon_label(value):
    return [f"Exploration vs Exploitation: {int(value*100)}% Exploration"]

@app.callback(
    [Output('reward-description', 'children')],
    [Input('reward-function-dropdown', 'value')]
)
def update_reward_description(value):
    return [REWARD_FUNCTIONS[value]['description']]

@app.callback(
    [Output('play-pause-btn', 'children'),
     Output('play-pause-btn', 'className')],
    [Input('play-pause-btn', 'n_clicks')],
    prevent_initial_call=True
)
def toggle_game(n_clicks):
    if n_clicks:
        game_state.is_running = not game_state.is_running
        
        if game_state.is_running:
            # Start game thread
            if game_state.game_thread is None or not game_state.game_thread.is_alive():
                game_state.game_thread = threading.Thread(target=game_loop, daemon=True)
                game_state.game_thread.start()
            return '⏸️ Stopp', 'bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2'
        else:
            return '▶️ Start', 'bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2'
    
    return '▶️ Start', 'bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2'

@app.callback(
    [Output('game-state', 'children')],
    [Input('reset-btn', 'n_clicks')],
    prevent_initial_call=True
)
def reset_game(n_clicks):
    if n_clicks:
        game_state.is_running = False
        game_state.reset()
    return ['']

@app.callback(
    [Output('game-grid', 'figure'),
     Output('episode-display', 'children'),
     Output('step-display', 'children'),
     Output('reward-display', 'children'),
     Output('avg-reward-display', 'children'),
     Output('last-action-info', 'children'),
     Output('performance-graph', 'figure')],
    [Input('interval-component', 'n_intervals'),
     Input('epsilon-slider', 'value'),
     Input('reward-function-dropdown', 'value')]
)
def update_display(n_intervals, epsilon, reward_function):
    # Update game parameters
    game_state.epsilon = epsilon
    game_state.reward_function = reward_function
    
    # Create grid figure
    grid_fig = create_grid_figure()
    
    # Performance graph
    perf_fig = create_performance_figure()
    
    # Last action info
    action_names = ['↑ Hoch', '↓ Runter', '← Links', '→ Rechts']
    if game_state.last_action is not None:
        last_action_info = html.Div([
            html.Div("Letzte Aktion:", className="text-sm text-gray-600"),
            html.Div(action_names[game_state.last_action], className="font-semibold"),
            html.Div([
                "Belohnung: ",
                html.Span(f"{'+' if game_state.last_reward > 0 else ''}{game_state.last_reward}",
                         className="text-green-600" if game_state.last_reward > 0 else "text-red-600")
            ], className="text-sm text-gray-600")
        ])
    else:
        last_action_info = html.Div("Noch keine Aktion", className="text-sm text-gray-600")
    
    # Average reward
    avg_reward = np.mean(list(game_state.episode_rewards)[-10:]) if game_state.episode_rewards else 0
    
    return (
        grid_fig,
        str(game_state.episode),
        str(game_state.step_count),
        f"{game_state.total_reward:.1f}",
        f"{avg_reward:.1f}",
        last_action_info,
        perf_fig
    )

def create_grid_figure():
    # Create grid
    grid_data = []
    annotations = []
    
    for i in range(game_state.grid_size):
        for j in range(game_state.grid_size):
            # Determine cell type and color
            if [i, j] == game_state.robot_pos:
                color = 'lightblue'
                symbol = '🤖'
            elif [i, j] == game_state.goal_pos:
                color = 'lightgreen'
                symbol = '🎯'
            elif [i, j] in game_state.obstacles:
                color = 'lightcoral'
                symbol = '🚛'
            elif [i, j] == [0, 0]:
                color = 'lightyellow'
                symbol = '🏠'
            else:
                color = 'white'
                symbol = ''
            
            grid_data.append({
                'x': j, 'y': game_state.grid_size - 1 - i,  # Flip y-axis
                'color': color, 'symbol': symbol
            })
            
            # Add annotation for symbols
            if symbol:
                annotations.append({
                    'x': j, 'y': game_state.grid_size - 1 - i,
                    'text': symbol,
                    'showarrow': False,
                    'font': {'size': 20}
                })
    
    df = pd.DataFrame(grid_data)
    
    fig = px.scatter(df, x='x', y='y', color='color',
                     color_discrete_map={color: color for color in df['color'].unique()})
    
    fig.update_traces(marker=dict(size=30, line=dict(width=2, color='black')))
    fig.update_layout(
        showlegend=False,
        xaxis=dict(showgrid=True, zeroline=False, range=[-0.5, game_state.grid_size-0.5]),
        yaxis=dict(showgrid=True, zeroline=False, range=[-0.5, game_state.grid_size-0.5]),
        annotations=annotations,
        plot_bgcolor='white',
        height=400
    )
    
    return fig

def create_performance_figure():
    if len(game_state.episode_rewards) < 2:
        return go.Figure()
    
    rewards = list(game_state.episode_rewards)
    episodes = list(range(len(rewards)))
    
    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=episodes, y=rewards,
        mode='lines+markers',
        name='Episode Rewards',
        line=dict(color='blue', width=2)
    ))
    
    fig.update_layout(
        title="Belohnung pro Episode",
        xaxis_title="Episode",
        yaxis_title="Belohnung",
        height=200,
        margin=dict(l=40, r=40, t=40, b=40)
    )
    
    return fig

# CSS Styling
app.index_string = '''
<!DOCTYPE html>
<html>
    <head>
        {%metas%}
        <title>{%title%}</title>
        {%favicon%}
        {%css%}
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body>
        {%app_entry%}
        <footer>
            {%config%}
            {%scripts%}
            {%renderer%}
        </footer>
    </body>
</html>
'''

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8050)