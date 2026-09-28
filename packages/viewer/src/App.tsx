import { DiagramCanvas } from './canvas/DiagramCanvas';
import { commerceApiLayout } from './samples/commerce-api.layout';
import { useTheme } from './theme/theme';

export function App() {
  const { theme } = useTheme();
  return (
    <main className="h-full bg-stage">
      <DiagramCanvas diagram={commerceApiLayout} theme={theme} />
    </main>
  );
}
