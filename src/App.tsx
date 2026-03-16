import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import { FilialProvider } from "@/contexts/FilialContext";
import Dashboard from "./pages/Dashboard";
import PDV from "./pages/PDV";
import Produtos from "./pages/Produtos";
import Clientes from "./pages/Clientes";
import Funcionarios from "./pages/Funcionarios";
import Vendas from "./pages/Vendas";
import Estoque from "./pages/Estoque";
import Caixa from "./pages/Caixa";
import Malas from "./pages/Malas";
import Relatorios from "./pages/Relatorios";
import NotasFiscais from "./pages/NotasFiscais";
import EmitirNF from "./pages/EmitirNF";
import ConfiguracaoFiscal from "./pages/ConfiguracaoFiscal";
import Empresas from "./pages/Empresas";
import CertificadoDigital from "./pages/CertificadoDigital";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: (
      <FilialProvider>
        <AppLayout />
      </FilialProvider>
    ),
    children: [
      { path: "/", element: <Dashboard /> },
      { path: "/pdv", element: <PDV /> },
      { path: "/produtos", element: <Produtos /> },
      { path: "/clientes", element: <Clientes /> },
      { path: "/funcionarios", element: <Funcionarios /> },
      { path: "/vendas", element: <Vendas /> },
      { path: "/estoque", element: <Estoque /> },
      { path: "/caixa", element: <Caixa /> },
      { path: "/malas", element: <Malas /> },
      { path: "/relatorios", element: <Relatorios /> },
      { path: "/notas-fiscais", element: <NotasFiscais /> },
      { path: "/emitir-nf", element: <EmitirNF /> },
      { path: "/configuracao-fiscal", element: <ConfiguracaoFiscal /> },
      { path: "/empresas", element: <Empresas /> },
      { path: "/certificado-digital", element: <CertificadoDigital /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <RouterProvider router={router} />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
