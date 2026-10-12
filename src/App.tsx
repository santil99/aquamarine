import { Routes, Route, Link } from 'react-router';
import { Card, Button } from '@heroui/react';

function Home() {
  return (
    <Card className="max-w-md">
      <Card.Content className="gap-4 flex flex-col">
        <Card.Title className="text-xl font-bold">Gestión Comercial - Inicio</Card.Title>
        <Card.Description>
          Aplicación inicializada limpia y lista para programar.
        </Card.Description>
        <Button variant="primary">
          <Link to="/ventas">Ir a Ventas</Link>
        </Button>
      </Card.Content>
    </Card>
  );
}

function Sales() {
  return (
    <Card className="max-w-md">
      <Card.Content className="gap-4 flex flex-col">
        <Card.Title className="text-xl font-bold">Listado de Ventas</Card.Title>
        <Card.Description>
          Aquí se mostrará la tabla comercial.
        </Card.Description>
        <Button variant="outline">
          <Link to="/">Volver al Inicio</Link>
        </Button>
      </Card.Content>
    </Card>
  );
}

export default function App() {
  return (
    <main className="p-8 min-h-screen bg-background flex flex-col items-center justify-center">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ventas" element={<Sales />} />
      </Routes>
    </main>
  );
}