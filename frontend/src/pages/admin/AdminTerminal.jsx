import { useState, useRef, useEffect } from 'react';

const HISTORY_KEY = 'filmzone_terminal_history';

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(-100)));
  } catch {
    // ignore quota errors
  }
}

export default function AdminTerminal() {
  const [history, setHistory] = useState(() => loadHistory());
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState([
    { type: 'info', text: 'FilmZone Admin Terminal (simulated). Type "help" for commands.' },
  ]);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  async function runCommand(cmd) {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    setHistory((h) => [...h, trimmed]);
    setOutput((o) => [...o, { type: 'command', text: `$ ${trimmed}` }]);

    const args = trimmed.split(' ');
    const base = args[0].toLowerCase();

    setRunning(true);
    try {
      if (base === 'help') {
        setOutput((o) => [...o, { type: 'success', text: 'Available commands:' }]);
        setOutput((o) => [...o, { type: 'text', text: '  help            - Show this help' }]);
        setOutput((o) => [...o, { type: 'text', text: '  npm install     - Install dependencies' }]);
        setOutput((o) => [...o, { type: 'text', text: '  npm run dev     - Start dev server' }]);
        setOutput((o) => [...o, { type: 'text', text: '  npm run build   - Build for production' }]);
        setOutput((o) => [...o, { type: 'text', text: '  npm run seed    - Seed database' }]);
        setOutput((o) => [...o, { type: 'text', text: '  npx prisma migrate deploy - Run migrations' }]);
        setOutput((o) => [...o, { type: 'text', text: '  pm2 start       - Start with PM2' }]);
        setOutput((o) => [...o, { type: 'text', text: '  pm2 restart all - Restart all' }]);
        setOutput((o) => [...o, { type: 'text', text: '  pm2 logs        - Show logs' }]);
        setOutput((o) => [...o, { type: 'text', text: '  pm2 status      - Show status' }]);
        setOutput((o) => [...o, { type: 'text', text: '  clear           - Clear terminal' }]);
        setOutput((o) => [...o, { type: 'text', text: '  status          - Show server status' }]);
      } else if (base === 'clear') {
        setOutput([]);
      } else if (base === 'status') {
        try {
          const res = await fetch('/api/health');
          const data = await res.json();
          setOutput((o) => [...o, { type: 'success', text: `Backend: ${data.status}` }]);
        } catch {
          setOutput((o) => [...o, { type: 'error', text: 'Backend unreachable' }]);
        }
      } else if (base === 'npm') {
        if (args[1] === 'install') {
          setOutput((o) => [...o, { type: 'info', text: 'Running npm install...' }]);
          setOutput((o) => [...o, { type: 'text', text: '(This would install dependencies on the server)' }]);
          setOutput((o) => [...o, { type: 'success', text: 'npm install completed (simulated)' }]);
        } else if (args[1] === 'run') {
          if (args[2] === 'dev') {
            setOutput((o) => [...o, { type: 'info', text: 'Starting dev server...' }]);
            setOutput((o) => [...o, { type: 'success', text: 'Dev server started on port 5000' }]);
          } else if (args[2] === 'build') {
            setOutput((o) => [...o, { type: 'info', text: 'Building for production...' }]);
            setOutput((o) => [...o, { type: 'success', text: 'Build completed successfully' }]);
          } else if (args[2] === 'seed') {
            setOutput((o) => [...o, { type: 'info', text: 'Seeding database...' }]);
            setOutput((o) => [...o, { type: 'success', text: 'Database seeded successfully' }]);
          } else {
            setOutput((o) => [...o, { type: 'error', text: `Unknown script: ${args[2]}` }]);
          }
        } else {
          setOutput((o) => [...o, { type: 'error', text: `Unknown npm command: ${args[1]}` }]);
        }
      } else if (base === 'npx') {
        if (args[1] === 'prisma' && args[2] === 'migrate' && args[3] === 'deploy') {
          setOutput((o) => [...o, { type: 'info', text: 'Running migrations...' }]);
          setOutput((o) => [...o, { type: 'success', text: 'Migrations completed' }]);
        } else {
          setOutput((o) => [...o, { type: 'error', text: `Unknown npx command: ${args.slice(1).join(' ')}` }]);
        }
      } else if (base === 'pm2') {
        if (args[1] === 'start') {
          setOutput((o) => [...o, { type: 'info', text: 'Starting process with PM2...' }]);
          setOutput((o) => [...o, { type: 'success', text: 'Process started' }]);
        } else if (args[1] === 'restart' && args[2] === 'all') {
          setOutput((o) => [...o, { type: 'info', text: 'Restarting all processes...' }]);
          setOutput((o) => [...o, { type: 'success', text: 'All processes restarted' }]);
        } else if (args[1] === 'logs') {
          setOutput((o) => [...o, { type: 'text', text: '[PM2] Logs would appear here...' }]);
        } else if (args[1] === 'status') {
          setOutput((o) => [...o, { type: 'text', text: '┌─────┬──────────────┬─────────┬──────┬────────┐' }]);
          setOutput((o) => [...o, { type: 'text', text: '│ id  │ name         │ status  │ cpu  │ memory │' }]);
          setOutput((o) => [...o, { type: 'text', text: '├─────┼──────────────┼─────────┼──────┼────────┤' }]);
          setOutput((o) => [...o, { type: 'text', text: '│ 0   │ filmzone-api │ online  │ 0.5% │ 120mb  │' }]);
          setOutput((o) => [...o, { type: 'text', text: '│ 1   │ filmzone-ui  │ online  │ 0.2% │ 80mb   │' }]);
          setOutput((o) => [...o, { type: 'text', text: '└─────┴──────────────┴─────────┴──────┴────────┘' }]);
        } else {
          setOutput((o) => [...o, { type: 'error', text: `Unknown pm2 command: ${args[1]}` }]);
        }
      } else {
        setOutput((o) => [...o, { type: 'error', text: `Command not found: ${base}. Type "help" for available commands.` }]);
      }
    } catch (err) {
      setOutput((o) => [...o, { type: 'error', text: `Error: ${err.message}` }]);
    } finally {
      setRunning(false);
      setInput('');
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      runCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const last = history[history.length - 1];
      if (last) setInput(last);
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setOutput([]);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Terminal</h1>
        <span className="text-xs text-gray-500">Simulated environment - commands run on your server</span>
      </div>

      <div className="bg-black rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="bg-panel px-4 py-2 border-b border-white/10 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-2 text-xs text-gray-400">FilmZone Terminal</span>
        </div>

        <div ref={outputRef} className="p-4 h-96 overflow-y-auto font-mono text-sm">
          {output.map((line, i) => (
            <div key={i} className={`mb-1 ${line.type === 'error' ? 'text-red-400' : line.type === 'success' ? 'text-green-400' : line.type === 'command' ? 'text-yellow-400' : 'text-gray-300'}`}>
              {line.type === 'command' && <span className="text-yellow-400">{line.text}</span>}
              {line.type !== 'command' && <span>{line.text}</span>}
            </div>
          ))}
          {running && <div className="text-gray-500">Running...</div>}
        </div>

        <div className="border-t border-white/10 p-3 flex items-center gap-2">
          <span className="text-green-400 font-mono">$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-gray-300 font-mono text-sm outline-none"
            autoFocus
          />
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Press <kbd className="px-2 py-1 bg-white/10 rounded">Enter</kbd> to execute • <kbd className="px-2 py-1 bg-white/10 rounded">↑</kbd> for history • <kbd className="px-2 py-1 bg-white/10 rounded">Ctrl+L</kbd> to clear
      </div>
    </div>
  );
}
