
export const LoadingState = () => {
  return (
    <div className="text-center py-16">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading your tracked products...</p>
    </div>
  );
};
