import { useState, useEffect } from 'react';
import './App.css'

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: 'work' | 'personal' | 'other';
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [editId, setEditId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
        category: 'personal'
      }]);
      setInputValue('');
    }
  };

  const removeTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const startEdit = (id: number, text: string) => {
    setEditId(id);
    setEditText(text);
  };

  const saveEdit = () => {
    if (editId !== null && editText.trim()) {
      setTodos(todos.map(todo =>
        todo.id === editId ? { ...todo, text: editText.trim() } : todo
      ));
      setEditId(null);
      setEditText('');
    }
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText('');
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(todo => !todo.completed).length;
  const completedCount = todos.length - activeCount;

  return (
    <div className="app-container">
      <div className="todo-card">
        <h1>Todo List</h1>
        
        <div className="input-section">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="Add a new task..."
            className="todo-input"
          />
          <button onClick={addTodo} className="add-button">
            Add
          </button>
        </div>

        <div className="filter-section">
          <button 
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'filter-active' : ''}
          >
            All ({todos.length})
          </button>
          <button 
            onClick={() => setFilter('active')}
            className={filter === 'active' ? 'filter-active' : ''}
          >
            Active ({activeCount})
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={filter === 'completed' ? 'filter-active' : ''}
          >
            Completed ({completedCount})
          </button>
        </div>

        <div className="stats">
          <p>Total: {todos.length} | Active: {activeCount} | Completed: {completedCount}</p>
        </div>

        <ul className="todo-list">
          {filteredTodos.map(todo => (
            <li 
              key={todo.id} 
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
            >
              {editId === todo.id ? (
                <div className="edit-mode">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    autoFocus
                  />
                  <button onClick={saveEdit} className="save-btn">Save</button>
                  <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                </div>
              ) : (
                <>
                  <div className="todo-content" onClick={() => toggleTodo(todo.id)}>
                    <span className="checkbox">{todo.completed && '✓'}</span>
                    <span className="todo-text">{todo.text}</span>
                  </div>
                  <div className="todo-actions">
                    <button 
                      onClick={() => startEdit(todo.id, todo.text)}
                      className="edit-button"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => removeTodo(todo.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {filteredTodos.length === 0 && (
          <p className="empty-state">No tasks found. Add some!</p>
        )}
      </div>
    </div>
  );
}

export default App;