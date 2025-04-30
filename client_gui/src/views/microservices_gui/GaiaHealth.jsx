import { useState } from 'react';
import ManagerTemplate from '../../components/template/ManagerTemplate';
import { Button, Card, Flex, Metric, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TextInput, Title } from '@tremor/react';
import { useDispatch } from 'react-redux';
import { uploadRagFile } from '../../api/store/actions/gaia/rag_file.actions';

function ContentArea() {
    const dispatch = useDispatch();

    const [selectedFile, setSelectedFile] = useState(null);
    // const [isUploading, setIsUploading] = useState(false);
    // const chunkSize = 5 * 1024 * 1024; // 5MB

    // // Function to handle file selection
    // const handleFileChange2 = (event) => {
    //     const file = event.target.files[0];
    //     setSelectedFile(file);
    //     console.log('Selected file:', file);
    // };

    // const uploadChunk = (chunk, chunkIndex, totalChunks) => {
    //     const formData = new FormData();
    //     formData.append('chunkFile', chunk);
    //     formData.append('chunkIndex', chunkIndex);
    //     formData.append('totalChunks', totalChunks);
    //     formData.append('fileName', selectedFile.name);
    //     console.log(`Uploading chunk ${chunkIndex + 1} of ${totalChunks}...`);

    //     try {
    //         dispatch(uploadRagFile(formData));
    //     } catch (error) {
    //         console.error('Error uploading chunk:', error);
    //     }
    // }

    // const handleFileUpload2 = async (event) => {
    //     event.preventDefault();

    //     if (!selectedFile) {
    //         alert("Please select a file to upload.");
    //         return;
    //     }

    //     setIsUploading(true);
    //     const totalChunks = Math.ceil(selectedFile.size / chunkSize);

    //     for (let i = 0; i < totalChunks; i++) {
    //         const start = i * chunkSize;
    //         const end = Math.min(selectedFile.size, start + chunkSize);
    //         const chunk = selectedFile.slice(start, end);
    //         uploadChunk(chunk, i, totalChunks);
    //     }

    //     alert('File uploaded successfully!');
    //     setIsUploading(false);
    // }

    // Function to handle file selection
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
        console.log('Selected file:', file);
    };

    // Function to handle file upload
    const handleFileUpload = async (event) => {
        event.preventDefault();

        if (!selectedFile) {
            alert("Please select a file to upload.");
            return;
        }

        // Create FormData object to send the file to the server
        const formData = new FormData();
        formData.append('file', selectedFile);
        console.log('File to upload:', selectedFile);
        dispatch(uploadRagFile(formData));


    };

    return (
        <>
            <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                className='text-2xl font-bold text-gray-800'>Gaia Health</Metric>
            <div className="grid md:grid-cols-5 grid-cols-1 w-full">
                <div className="col-span-3">
                    <div className="w-full flex flex-col justify-between p-2">
                        <div className="flex-auto w-full">
                            <Card>
                                <Flex>
                                    <Title>Upload RAG File</Title>
                                </Flex>
                                <form className='pt-5' onSubmit={handleFileUpload}>
                                    <Flex>
                                        <TextInput
                                            id="rag-file"
                                            type="file"
                                            onChange={handleFileChange}
                                            className="mt-4 me-3 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                                            accept=".csv, .json, .txt, .pdf"
                                        />
                                        <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                                            Upload
                                        </button>
                                    </Flex>
                                    <Title className='mt-2 text-xs text-gray-500 dark:text-gray-500'>
                                        You are only allowed to upload files with the following extensions: .csv, .json, .txt, .pdf
                                    </Title>
                                </form>
                            </Card>
                            <Card className='mt-5 flex justify-center'>
                                <Button variant="primary" color="indigo" className="p-2 rounded-lg mb-4">Add all to VectorDB </Button>
                                <Button variant="primary" color="rose" className="p-2 rounded-lg ms-4 mb-4"> Delete all from VectorDB </Button>
                            </Card>
                        </div>
                    </div>
                </div>
                <div className="col-span-2 w-full">
                    <div className='w-full p-2'>
                        <Card className='max-w-full mx-auto'>
                            <Title>List files</Title>
                            <Table className='mt-5'>
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>File Name</TableHeaderCell>
                                        <TableHeaderCell>Created Date</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>File1</TableCell>
                                        <TableCell>2024-01-01</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>File2</TableCell>
                                        <TableCell>2024-01-01</TableCell>
                                    </TableRow>

                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>
            </div>
            {/* <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                className='text-2xl font-bold text-gray-800'>Gaia Health</Metric>
            <div className="grid md:grid-cols-5 grid-cols-1 w-full">
                <div className="col-span-3">
                    <div className="w-full flex flex-col justify-between p-2">
                        <div className="flex-auto w-full">
                            <Card>
                                <Flex>
                                    <Title>Upload RAG File</Title>
                                </Flex>
                                <form className='pt-5' onSubmit={handleFileUpload}>
                                    <Flex>
                                        <TextInput
                                            id="rag-file"
                                            type="file"
                                            onChange={handleFileChange}
                                            className="mt-4 me-3 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                                            accept=".csv, .json, .txt, .pdf"
                                        />
                                        <button
                                            type="submit"
                                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                            disabled={isUploading} // Vô hiệu hóa nút khi đang upload
                                        >
                                            {isUploading ? "Uploading..." : "Upload"}
                                        </button>
                                    </Flex>
                                    <Title className='mt-2 text-xs text-gray-500 dark:text-gray-500'>
                                        You are only allowed to upload files with the following extensions: .csv, .json, .txt, .pdf
                                    </Title>
                                </form>
                            </Card>
                            <Card className='mt-5 flex justify-center'>
                                <Button variant="primary" color="indigo" className="p-2 rounded-lg mb-4">Add all to VectorDB </Button>
                                <Button variant="primary" color="rose" className="p-2 rounded-lg ms-4 mb-4"> Delete all from VectorDB </Button>
                            </Card>
                        </div>
                    </div>
                </div>
                <div className="col-span-2 w-full">
                    <div className='w-full p-2'>
                        <Card className='max-w-full mx-auto'>
                            <Title>List files</Title>
                            <Table className='mt-5'>
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>File Name</TableHeaderCell>
                                        <TableHeaderCell>Created Date</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>File1</TableCell>
                                        <TableCell>2024-01-01</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>File2</TableCell>
                                        <TableCell>2024-01-01</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>
            </div> */}
        </>
    )
}

const GaiaHealth = () => {
    return (
        <ManagerTemplate>
            <ContentArea />
        </ManagerTemplate>
    )
}

export default GaiaHealth;