import React, { useState } from 'react'
import { useDropzone } from "react-dropzone";

interface FileUploaderProps{
  //optional, doesn't return anything
  onFileSelect?: (file: File | null ) => void;
}

const FileUploader = ( {onFileSelect}: FileUploaderProps) => {

  const [file, setFile ] = useState(); 

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      const file = acceptedFiles[0] || null;
      
      //calling the handlefileselct function. 
      onFileSelect?.(file);
      
    },
  });

  return (
    <div className="w-full gradient-border">
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="space-y-4 cursor-pointer">
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            <img src="/icons/info.svg" alt="upload" className="size-20"/>
          </div>
          {file ? (
            <div>

            </div>
          ): (
            <div>
              <p className="text-lg text-gray-500">
                <span className="font-semibold">
                  Click to upload 
                </span> or drag and drop 

              </p>
              <p className="text-lg text-gray-500">
                PDF (Max 20B)
              </p>

            </div>

          )}

        </div>
      </div>
    </div>
  );
}

export default FileUploader
