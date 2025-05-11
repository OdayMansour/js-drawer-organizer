export class STLGenerator {
    constructor(depth) {
        this.depth = depth;

        // Connector is 50% of depth or 10mm, whichever is bigger
        const derivedDepth = this.depth;
        const derivedDepthString = this.toScientificNotation(derivedDepth)

        this.configurations = [
            {
                templateUrl: './resources/stl/L.stl.template',
                depthToken: '__DEPTH__',
                depthValue: derivedDepthString
            },
            {
                templateUrl: './resources/stl/T.stl.template',
                depthToken: '__DEPTH__',
                depthValue: derivedDepthString
            },
            {
                templateUrl: './resources/stl/X.stl.template',
                depthToken: '__DEPTH__',
                depthValue: derivedDepthString
            }
        ];

        document.getElementById('downloadSTL').addEventListener('click', () => {
            this.generateFiles()
            .then(files => {
                console.log('Generated ZIP file.');
                return this.createAndDownloadZip(files);
            })
            .then(() => {
                console.log('ZIP file downloaded successfully');
            })
            .catch(err => {
                console.error('Failed:', err);
            });
        });

    }

    toScientificNotation(num, decimalPlaces = 6) {
        let result = num.toExponential(decimalPlaces);
        
        // Add leading zero to the exponent if needed
        return result.replace(/e([+-])(\d)$/, function(match, sign, digit) {
              return `e${sign}0${digit}`;
        });
    }
      

    async replaceTokenInAsciiFile(templateUrl, token, value) {
        try {
            // Fetch the template file from the URL
            const response = await fetch(templateUrl);

            if (!response.ok) {
                throw new Error(`Failed to fetch template: ${response.status} ${response.statusText}`);
            }

            // Get the template content as text
            const templateContent = await response.text();
            // console.log(templateContent)

            // Replace the token with the provided value
            const modifiedContent = templateContent.replace(new RegExp(token, 'g'), value);

            return modifiedContent;
        } catch (error) {
            console.error('Error processing ASCII file:', error);
            throw error;
        }
    }

    async generateFiles() {
        try {
            const generatedFiles = [];

            // Process each configuration
            for (const config of this.configurations) {
                const content = this.replaceTokenInAsciiFile(
                    config.templateUrl,
                    config.depthToken,
                    config.depthValue
                );
                // Extract the original filename from the template URL and remove the .template extension
                const originalFilename = config.templateUrl.split('/').pop();
                const filename = originalFilename.replace('.template', '');

                // Add to our collection of generated files
                generatedFiles.push({
                    filename,
                    content
                });
            }

            return generatedFiles;
        } catch (error) {
            console.error('Error generating files:', error);
            throw error;
        }
    }

    async createAndDownloadZip(files) {
    // Load JSZip library dynamically
        if (typeof JSZip === 'undefined') {
            await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
            });
        }

        // Create a new ZIP file
        const zip = new JSZip();

        // Add each file to the ZIP
        files.forEach(file => {
            zip.file(file.filename, file.content);
        });

        // Generate the ZIP file content as a blob
        const zipBlob = await zip.generateAsync({
            type: 'blob',
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }});

        // Create a download link for the ZIP
        const downloadUrl = URL.createObjectURL(zipBlob);
        const downloadLink = document.createElement('a');
        downloadLink.href = downloadUrl;
        downloadLink.download = 'generated_files.zip';

        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();

        // Clean up
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(downloadUrl);
    }

}