import JSZip from "jszip";

// Helper method to zip file list returned from a webkitdirectory dialog into a zip blob to send to Piranha web API
export default async (files: FileList) => {
    const zip = new JSZip();

    files.forEach(file => {
      // Preserve folder structure using file.webkitRelativePath
      const filePath = file.webkitRelativePath || file.name;
      zip.file(filePath, file);
    });

    return await zip.generateAsync({ type: "blob" });
}
