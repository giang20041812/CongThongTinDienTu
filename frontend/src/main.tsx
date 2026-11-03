import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { useLang } from './lib/i18n';
import './index.css';

// Keyed by language so every component (including date/number formatting) re-renders on a switch.
const Root = () => <App key={useLang()} />;

createRoot(document.getElementById('root')!).render(<Root />);
