export const mockWindowElectron = () => {
  (window as any).electron = {
    process: {
      versions: {
        electron: "1.1.1",
        chrome: "2.2.2",
        node: "3.3.3"
      }
    }
  };
};
