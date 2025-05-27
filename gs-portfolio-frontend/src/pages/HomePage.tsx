export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">
          Gaussian Splatting Portfolio
        </h1>
        <p className="text-lg text-muted-foreground">
          3Dモデルのコレクションをご覧ください
        </p>
      </div>
      
      <div className="mt-8">
        {/* GSFileGridコンポーネントのプレースホルダー */}
        <div className="text-center text-muted-foreground">
          GSファイル一覧がここに表示されます
        </div>
      </div>
    </div>
  )
} 