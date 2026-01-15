import Editor from '../components/Editor'; 

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="bg-white shadow-sm p-4 mb-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800">
            Document Editor with Pagination
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            A Tiptap-based editor for legal documents
          </p>
        </div>
      </header>
      
      <Editor />
    </main>
  );
}