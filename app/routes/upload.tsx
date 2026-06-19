import { type FormEvent, useState } from 'react';
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";
import { convertPdfToImage } from "~/lib/pdf2img";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();

    // FIX 1: Start as false. It should only be true when actively analyzing.
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleFileSelect = (file: File | null): void => {
        setFile(file);
    };

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file:File | null  }) => {
        setIsProcessing(true);
        setStatusText('Uploading the file ...');


            const uploadedFile = await fs.upload([file]);
            if (!uploadedFile) return setStatusText('Error: Failed to upload file');

            setStatusText('Converting to image ...');
            const imageFile = await convertPdfToImage(file);
            if (imageFile) return setStatusText('Error: Failed to convert PDF to image');

            setStatusText('Uploading the image ...');
            const uploadedImage = await fs.upload([imageFile.file]);
            if (!uploadedImage) return setStatusText('Error: Failed to upload image');

            setStatusText('Preparing data ...');
            const uuid = generateUUID();
            const data = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagepath: uploadedImage.path,
                companyName, jobTitle, jobDescription,
                feedback: ' '
            };
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText('Analyzing ...');

            const feedback = await ai.feedback(
                uploadedFile.path,
                prepareInstructions({ jobTitle, jobDescription })
            );
            if (!feedback) return setStatusText('Error: Failed to analyze resume');

            const feedbackText = typeof feedback.message.content === 'string'
                ? feedback.message.content
                : feedback.message.content[0].text;

            data.feedback = JSON.parse(feedbackText);
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText('Analysis complete, redirecting ...');

            // Redirect to the resume feedback page using your generated UUID

            navigate(`/resume/${uuid}`);

    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // FIX 2: e.currentTarget is safely the form element itself
        const formData = new FormData(e.currentTarget);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if (!file) {
            alert("Please upload a resume first!");
            return;
        }

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    };

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>

                    {/* FIX 3: Cleaned up conditional rendering blocks */}
                    {isProcessing ? (
                        <div className="flex flex-col items-center gap-4 mt-4">
                            <h2 className="text-xl font-semibold text-purple-600">{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-64" alt="Scanning..." />
                        </div>
                    ) : (
                        <>
                            <h2>Drop your resume for an ATS score and improvement tips</h2>

                            <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                                <div className="form-div">
                                    <label htmlFor="company-name"> Company Name</label>
                                    <input type="text" name="company-name" placeholder="Company Name" id="company-name" required />
                                </div>

                                <div className="form-div">
                                    <label htmlFor="job-title"> Job Title </label>
                                    <input type="text" name="job-title" placeholder="Job Title" id="job-title" required />
                                </div>

                                <div className="form-div">
                                    <label htmlFor="job-description"> Job Description </label>
                                    <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" required />
                                </div>

                                <div className="form-div">
                                    <label htmlFor="uploader"> Upload Resume</label>
                                    <FileUploader onFileSelect={handleFileSelect} />
                                </div>

                                <button className="primary-button" type="submit">
                                    Analyze Resume
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Upload;