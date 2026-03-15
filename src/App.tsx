import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import PDV from "./pages/PDV";
import Produtos from "./pages/Produtos";
import Clientes from "./pages/Clientes";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pdv" element={<PDV />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/estoque" element={<Estoque />} />
            <Route path="/caixa" element={<Caixa />} />
            <Route path="/malas" element={<Malas />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/notas-fiscais" element={<NotasFiscais />} />
            <Route path="/emitir-nf" element={<EmitirNF />} />
            <Route path="/configuracao-fiscal" element={<ConfiguracaoFiscal />} />
            <Route path="/empresas" element={<Empresas />} />
            <Route path="/certificado-digital" element={<CertificadoDigital />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
