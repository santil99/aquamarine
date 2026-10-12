import { Routes, Route } from 'react-router';
import { SalesListRoute } from '@/router/SalesListRoute';

export default function App() {
  return (
    <main className="p-4 md:p-8 min-h-screen bg-background flex flex-col items-center">
      <Routes>
        <Route path="/" element={<SalesListRoute />} />
      </Routes>
    </main>
  );
}