import React, { useState, type ChangeEvent, type ReactNode } from 'react';

const ESignWorkflow: React.FC = () => {
  // States
  const [uploadedFilePath, setUploadedFilePath] = useState<string>('');
  const [role1File, setRole1File] = useState<File | null>(null);

  const [role1Name, setRole1Name] = useState<string>('Puneet HR');
  const [role1Email, setRole1Email] = useState<string>('psethi@yopmail.com');

  const [role2Name, setRole2Name] = useState<string>('');
  const [role2Email, setRole2Email] = useState<string>('');

  const [role3Name, setRole3Name] = useState<string>('');
  const [role3Email, setRole3Email] = useState<string>('');
  const [role3Phone, setRole3Phone] = useState<string>('');

  const [templateId, setTemplateId] = useState<string>('');
  const [role2Status, setRole2Status] = useState<ReactNode>('');
  const [role3Status, setRole3Status] = useState<ReactNode>('');
  const [documentIdRole3, setDocumentIdRole3] = useState<string>('Waiting for Document to be Prepared by Role 2');

  const [initiateStatus, setInitiateStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Hardcoded widget values (from hidden inputs in original)
  const r2Widget = {
    x: 35.11656207598372,
    y: 449.2039518317504,
    w: 150,
    h: 60,
    page: 1,
  };

  const r3Widget = {
    x: 383.506105834464,
    y: 449.65943012211676,
    w: 145.31886024423338,
    h: 58.12754409769335,
    page: 1,
  };

  // Handlers
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setRole1File(e.target.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!role1File) {
      alert('Please select a PDF file.');
      return;
    }

    setIsLoading(true);
    setInitiateStatus('Uploading file...');

    try {
      const formData = new FormData();
      formData.append('file', role1File);

      const response = await fetch('http://localhost:3000/esign/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.filename) {
        setUploadedFilePath('uploads/' + result.filename);
        setInitiateStatus('File uploaded successfully!');
      } else {
        alert('Upload failed.');
      }
    } catch (error) {
      console.error(error);
      alert('Error during upload.');
    }

    setIsLoading(false);
  };

  const initiateWorkflow = async () => {
    if (!uploadedFilePath) {
      alert('Please upload and preview the PDF first.');
      return;
    }

    setIsLoading(true);
    setInitiateStatus('Creating template...');

    const payload = {
      filePath: uploadedFilePath,
      title: "Offer Letter",
      note: "sample Note",
      description: "sample Description",
      timeToCompleteDays: 15,
      signers: [
        {
          role: "Role3",
          name: "",
          email: "",
          phone: "",
          widgets: [
            { type: "signature", ...r3Widget },
          ],
        },
        {
          role: "Role2",
          name: role2Name,
          email: role2Email,
          phone: "",
          widgets: [
            { type: "signature", ...r2Widget },
          ],
        },
      ],
      send_email: true,
      sendInOrder: true,
      enableOTP: false,
      enableTour: false,
      sender_name: "opensign™",
      sender_email: "mailer@opensignlabs.com",
      allow_modifications: false,
    };

    try {
      const response = await fetch('http://localhost:3000/esign/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      setTemplateId(result.objectId);
      setInitiateStatus(`${result.message} Template ID: ${result.objectId}.`);
    } catch (error) {
      console.error(error);
      setInitiateStatus('Error during initiation.');
    }

    setIsLoading(false);
  };

  const role2Sign = async () => {
    if (!templateId || !role3Email) {
      alert('Please enter Template ID and Role 3 Email.');
      return;
    }

    setIsLoading(true);
    setRole2Status('Updating Role 3 and creating signing document...');

    const payload = {
      templateId,
      role: "Role2",
      role3Email,
      role3Name,
      role3Phone,
    };

    try {
      const response = await fetch('http://localhost:3000/esign/role2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();

      // Role 2 link
      const role2Link = result.signurl.find((item: { email: string }) => item.email === role2Email);
      setRole2Status(role2Link ? (
        <a className="text-blue-600 underline" href={role2Link.url} target="_blank" rel="noopener noreferrer">
          Click here to sign the document (Role 2)
        </a>
      ) : "No signing URL found for Role 2.");

      // Role 3 link
      const role3Link = result.signurl.find((item: { email: string }) => item.email === role3Email);
      if (role3Link) {
        setDocumentIdRole3('Document ready.');
        setRole3Status(
          <a className="text-blue-600 underline" href={role3Link.url} target="_blank" rel="noopener noreferrer">
            Click here to sign the document (Role 3)
          </a>
        );
      } else {
        setRole3Status("No signing URL found for Role 3.");
      }
    } catch (error) {
      console.error(error);
      setRole2Status('Error during Role 2 signing.');
    }

    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-center">eSign Workflow - Sequential Signing</h1>

      {/* Role 1 Section */}
      <section className="border rounded-lg p-4 mb-8 shadow">
        <h2 className="text-xl font-semibold mb-4">Role 1: Initiating Workflow</h2>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="mb-4 block w-full border rounded px-2 py-1"
        />
        {uploadedFilePath && (
          <div className="border mb-4 w-full h-[500px]">
            <iframe
              title="PDF Preview"
              src={`http://localhost:3000/esign/preview/${uploadedFilePath}`}
              className="w-full h-full"
            />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={role1Name}
            onChange={(e) => setRole1Name(e.target.value)}
            placeholder="Your Name"
            className="border rounded px-2 py-1"
          />
          <input
            type="email"
            value={role1Email}
            onChange={(e) => setRole1Email(e.target.value)}
            placeholder="Your Email"
            className="border rounded px-2 py-1"
          />
        </div>
        <h3 className="font-semibold mb-2">Phase 1: Add Sign Tags for Role 2 and Role 3</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={role2Name}
            onChange={(e) => setRole2Name(e.target.value)}
            placeholder="Role 2 Name"
            className="border rounded px-2 py-1"
          />
          <input
            type="email"
            value={role2Email}
            onChange={(e) => setRole2Email(e.target.value)}
            placeholder="Role 2 Email"
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          onClick={uploadFile}
          className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600 mr-2"
        >
          Upload PDF
        </button>
        <button
          onClick={initiateWorkflow}
          className="bg-blue-500 text-black px-4 py-2 rounded hover:bg-blue-600"
        >
          Initiate Workflow
        </button>
        {isLoading && <div className="loader mt-2" />}
        <p className="mt-2 text-gray-700">{initiateStatus}</p>
      </section>

      {/* Role 2 Section */}
      <section className="border rounded-lg p-4 mb-8 shadow">
        <h2 className="text-xl font-semibold mb-4">Phase 2: Role 2 Adds Role 3 Email, E-Sign (PDF) and Forward Role 3</h2>
        <input type="text" hidden value={templateId} readOnly />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={role3Name}
            onChange={(e) => setRole3Name(e.target.value)}
            placeholder="Role 3 Name"
            className="border rounded px-2 py-1"
          />
          <input
            type="email"
            value={role3Email}
            onChange={(e) => setRole3Email(e.target.value)}
            placeholder="Role 3 Email"
            className="border rounded px-2 py-1"
          />
          <input
            type="text"
            value={role3Phone}
            onChange={(e) => setRole3Phone(e.target.value)}
            placeholder="Role 3 Phone"
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          onClick={role2Sign}
          className="bg-purple-500 text-black px-4 py-2 rounded hover:bg-purple-600"
        >
          Submit Role 3 and Sign
        </button>
        <div className="mt-2">{role2Status}</div>
      </section>

      {/* Role 3 Section */}
      <section className="border rounded-lg p-4 shadow">
        <h2 className="text-xl font-semibold mb-4">Phase 3: Final Signing by Role 3</h2>
        <p className="mb-2">{documentIdRole3}</p>
        <div>{role3Status}</div>
      </section>
    </div>
  );
};

export default ESignWorkflow;
