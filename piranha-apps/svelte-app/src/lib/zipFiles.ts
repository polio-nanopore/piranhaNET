import JSZip from "jszip";

// Helper method to zip file list returned from a webkitdirectory dialog into a zip blob to send to Piranha web API
export default async (fileList: FileList) => {
    const zip = new JSZip();
    const files = Array.from(fileList);
    files.forEach(file => {
      // Preserve folder structure using file.webkitRelativePath
      console.log(`zipping ${file.name}`)
      const filePath = file.webkitRelativePath || file.name;
      zip.file(filePath, file);
    });

    const result = await zip.generateAsync({ type: "blob" });
    return result;
}
