import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { EditorPage } from '../../pages/editor/EditorPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<EditorPage />} />
        <Route path="/vault" element={<EditorPage />} />
        <Route path="/includes" element={<EditorPage />} />
        <Route path="/templates" element={<EditorPage />} />
        <Route path="/settings" element={<EditorPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
