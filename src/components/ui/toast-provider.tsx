"use client";

import * as Toast from "@radix-ui/react-toast";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider swipeDirection="right">
      {children}
      <Toast.Viewport className="fixed bottom-4 right-4 z-[100] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-2" />
    </Toast.Provider>
  );
}
