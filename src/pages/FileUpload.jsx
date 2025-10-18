import React, { useState, useRef } from "react";
import styled from "styled-components";
import axios from "axios";

// ================== Styled Components ==================
const Container = styled.div`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 600px;
  margin: 60px auto;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  font-size: 32px;
  font-weight: 500;
  margin-bottom: 30px;
`;

const UploadArea = styled.div`
  border: 2px dashed #d0d0d0;
  border-radius: 12px;
  padding: 60px 40px;
  text-align: center;
  background-color: ${(props) => (props.isDragOver ? "#f0f7ff" : "#fafafa")};
  margin-bottom: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: #1e88e5;
  }
`;

const UploadIcon = styled.div`
  width: 60px;
  height: 60px;
  margin: 0 auto 20px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    width: 50px;
    height: 60px;
    background-color: white;
    border: 2px solid #b0b0b0;
    border-radius: 6px;
    left: 5px;
  }

  &::after {
    content: "+";
    position: absolute;
    font-size: 32px;
    color: #1e88e5;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }
`;

const UploadText = styled.div`
  color: #666;
  font-size: 15px;

  label {
    color: #1e88e5;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }

    input {
      display: none;
    }
  }
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 20px;
  background-color: #fafafa;
`;

const FileIcon = styled.div`
  width: 40px;
  height: 50px;
  background-color: white;
  border: 2px solid #d0d0d0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #666;
  font-weight: 600;
  margin-right: 15px;
  flex-shrink: 0;
`;

const FileDetails = styled.div`
  flex-grow: 1;
`;

const FileName = styled.div`
  color: #333;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const FileSize = styled.span`
  color: #666;
  font-size: 13px;
`;

const UploadStatus = styled.span`
  color: #1e88e5;
  font-size: 13px;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 5px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: #1e88e5;
  width: ${(props) => props.width}%;
  transition: width 0.3s ease;
`;

// ================== Component ==================
const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (selectedFile) => {
    setFile(selectedFile);
    setProgress(0);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        "http://localhost:5000/convert",
        formData,
        {
          responseType: "blob",
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percent);
          },
        }
      );

      // Download the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = selectedFile.name.split(".")[0] + ".pdf";
      a.click();
      window.URL.revokeObjectURL(url);

      setProgress(100);
      setUploading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to convert file to PDF.");
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <Container>
      <Title>File Upload Useing Python</Title>

      <UploadArea
        isDragOver={isDragOver}
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <UploadIcon />
        <UploadText>
          Drag and drop or{" "}
          <label>
            browse
            <input type="file" ref={fileInputRef} onChange={handleFileChange} />
          </label>{" "}
          your files
        </UploadText>
      </UploadArea>

      {file && (
        <FileItem>
          <FileIcon>{file.name.split(".").pop().toUpperCase()}</FileIcon>
          <FileDetails>
            <FileName>{file.name}</FileName>
            <FileInfo>
              <FileSize>{(file.size / 1024 / 1024).toFixed(2)} MB</FileSize>
              <UploadStatus>
                {uploading ? `Creating PDF... ${progress}%` : "Done"}
              </UploadStatus>
            </FileInfo>
            {uploading && (
              <ProgressBar>
                <ProgressFill width={progress} />
              </ProgressBar>
            )}
          </FileDetails>
        </FileItem>
      )}
    </Container>
  );
};

export default FileUpload;
