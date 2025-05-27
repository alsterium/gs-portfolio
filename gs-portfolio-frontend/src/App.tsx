import { BrowserRouter, Routes, Route } from 'react-router';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { FileDetailPage } from './pages/FileDetailPage';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/view/:id" element={<FileDetailPage />} />
            {/* 管理者ルートは後で追加 */}
          </Routes>
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
