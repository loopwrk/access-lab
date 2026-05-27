export function useStudioToolbar() {
  const activeComponentName = useState<string | null>(
    "al-studio-toolbar-name",
    () => null,
  );

  return { activeComponentName };
}
