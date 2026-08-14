import React, { useRef } from "react";

function UploadPanel({ onFileSelect }) {

  const inputRef = useRef(null);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event) => {

    const file = event.target.files?.[0];

    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <>
      <div className="upload-panel">

        <div
          className="upload-area"
          onClick={openFilePicker}
        >

          <div className="cloud-icon">
            ☁️
          </div>

          <h2>
            Drag & drop files here
          </h2>

          <p>
            or
          </p>

          <button
            type="button"
            className="choose-files"
            onClick={(event) => {
              event.stopPropagation();
              openFilePicker();
            }}
          >
            Choose Files
          </button>

          <span>
            Supports: .exe, .dll, .js, .pdf,
            .docx, .zip, .rar and more
          </span>

        </div>

      </div>

      <input
        ref={inputRef}
        type="file"
        hidden
        onChange={handleFileChange}
      />
    </>
  );
}

export default UploadPanel;