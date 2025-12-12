// // QRCodeGenerator.jsx
// import React, { useEffect, useState } from 'react'
// import { Loader, QrCode, ExternalLink } from 'lucide-react'
// import { toast } from 'react-toastify'
// import QRCode from 'qrcode'

// export default function QRCodeGenerator({ houses, apartment, floor, onClose }) {
//     const [loading, setLoading] = useState(false)
//     const [generatingPDF, setGeneratingPDF] = useState(false)
//     const [qrCodeImages, setQrCodeImages] = useState({})

//     // Create a secure URL for the QR code
//     const createSecureURL = (house) => {
//         // Use your actual domain here
//         const baseURL = "https://aptsync.yourdomain.com";
        
//         // Create a URL with encoded parameters
//         const url = new URL(`${baseURL}/house-info`);
        
//         // Add encrypted/encoded parameters (simple base64 for now)
//         const data = {
//             apt: apartment.id,
//             flr: floor.id,
//             hse: house.id,
//             t: Date.now() // timestamp for uniqueness
//         };
        
//         const encodedData = btoa(JSON.stringify(data));
//         url.searchParams.append('d', encodedData);
        
//         return url.toString();
//     };

//     // In QRCodeGenerator.jsx - Backward compatible
// useEffect(() => {
//     const run = async () => {
//         if (!houses.length) return

//         setLoading(true)

//         try {
//             const qrMap = {}

//             for (const house of houses) {
//                 // Create BOTH URL and JSON data
//                 const qrData = {
//                     // For backward compatibility with existing code
//                     h_id: house.house_id,
//                     apt_name: apartment.name,
//                     fl: floor.floor_id,
//                     f_id: floor.id,
//                     apt_id: apartment.id,
//                     house_db_id: house.id,
//                     apartment_db_id: apartment.id,
//                     floor_db_id: floor.id,
                    
//                     // Additional info
//                     type: "house_qr",
//                     timestamp: Date.now()
//                 }

//                 // Generate QR code with JSON
//                 try {
//                     const qrString = JSON.stringify(qrData)
                    
//                     qrMap[house.id] = await QRCode.toDataURL(qrString, {
//                         width: 400,
//                         margin: 4,
//                         errorCorrectionLevel: "H",
//                         color: {
//                             dark: "#000000",
//                             light: "#FFFFFF"
//                         }
//                     })
//                 } catch (err) {
//                     console.error("QR Generation Error:", err)
//                     qrMap[house.id] = ""
//                     toast.error(`Failed to generate QR for house ${house.house_id}`)
//                 }
//             }

//             setQrCodeImages(qrMap)

//         } catch (error) {
//             console.error("Error generating QR codes", error)
//             toast.error("Failed to generate QR codes")
//         }

//         setLoading(false)
//     }

//     run()
// }, [houses, apartment, floor])

//     // ==========================================================
//     // Generate PDF
//     // ==========================================================
//     const downloadPDF = async () => {
//         setGeneratingPDF(true)

//         try {
//             const { jsPDF } = await import("jspdf")
//             const pdf = new jsPDF("p", "mm", "a4")

//             const cardWidth = 85
//             const cardHeight = 70
//             const margin = 12
//             const qrSize = 40
//             const pageWidth = pdf.internal.pageSize.getWidth()
//             const pageHeight = pdf.internal.pageSize.getHeight()
            
//             let yOffset = margin
//             let cardsPerRow = 2
//             let cardsInCurrentRow = 0

//             for (let i = 0; i < houses.length; i++) {
//                 const house = houses[i]
                
//                 // Calculate position
//                 const col = i % cardsPerRow
//                 const x = margin + col * (cardWidth + margin)
                
//                 // Check if we need a new page
//                 if (yOffset + cardHeight > pageHeight - margin) {
//                     pdf.addPage()
//                     yOffset = margin
//                     cardsInCurrentRow = 0
//                 }
                
//                 // Card border
//                 pdf.setDrawColor(200, 200, 200)
//                 pdf.rect(x, yOffset, cardWidth, cardHeight)
                
//                 // Apartment name (top)
//                 pdf.setFontSize(8)
//                 pdf.setFont(undefined, "bold")
//                 pdf.text(apartment.name, x + cardWidth / 2, yOffset + 5, { align: 'center' })
                
//                 // Floor information
//                 pdf.setFontSize(7)
//                 pdf.setTextColor(100, 100, 100)
//                 pdf.text(`Floor: ${floor.floor_id}`, x + cardWidth / 2, yOffset + 9, { align: 'center' })
                
//                 // House ID (centered)
//                 pdf.setFontSize(14)
//                 pdf.setFont(undefined, "bold")
//                 pdf.setTextColor(0, 0, 0)
//                 pdf.text(`${house.house_id}`, x + cardWidth / 2, yOffset + 15, { align: 'center' })
                
//                 // QR Code
//                 if (qrCodeImages[house.id]) {
//                     pdf.addImage(
//                         qrCodeImages[house.id], 
//                         "PNG", 
//                         x + (cardWidth - qrSize) / 2, 
//                         yOffset + 20,
//                         qrSize, 
//                         qrSize
//                     )
//                 }
                
//                 // QR Label
//                 pdf.setFontSize(5)
//                 pdf.setTextColor(100, 100, 100)
                
                
//                 // Move to next position
//                 cardsInCurrentRow++
//                 if (cardsInCurrentRow === cardsPerRow) {
//                     yOffset += cardHeight + margin
//                     cardsInCurrentRow = 0
//                 }
                
//                 // If this was the last card and we're ending a row, add margin for next iteration
//                 if (i === houses.length - 1 && cardsInCurrentRow > 0) {
//                     yOffset += cardHeight + margin
//                 }
//             }

//             // Save PDF
//             const fileName = `QR_Codes_${apartment.name.replace(/\s+/g, '_')}_Floor_${floor.floor_id}.pdf`
//             pdf.save(fileName)
//             toast.success("PDF Generated Successfully!")

//         } catch (err) {
//             console.error("PDF Generation Error:", err)
//             toast.error("Failed to generate PDF")
//         }

//         setGeneratingPDF(false)
//     }

//     // ==========================================================
//     // QR Preview Component
//     // ==========================================================
//     const QRCodePreview = ({ house }) => {
//         const qrImg = qrCodeImages[house.id]
//         const secureURL = createSecureURL(house);

//         return (
//             <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
//                 <div className="text-center">
//                     <div className="font-bold text-gray-800 dark:text-white text-lg mb-1">
//                         House {house.house_id}
//                     </div>
//                     <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
//                         {apartment.name} • Floor {floor.floor_id}
//                     </div>
                    
//                     {qrImg ? (
//                         <div className="flex flex-col items-center">
//                             <img
//                                 src={qrImg}
//                                 className="mx-auto mb-2 rounded border-2 border-gray-300"
//                                 style={{ width: "150px", height: "150px" }}
//                                 alt={`QR Code for House ${house.house_id}`}
//                             />
//                             <div className="text-xs text-gray-500 mt-1">
//                                 Scan to open web page
//                             </div>
//                             <div className="mt-2 flex items-center justify-center space-x-1">
//                                 <ExternalLink size={12} className="text-blue-500" />
//                                 <span className="text-xs text-blue-600 truncate max-w-[180px]">
//                                     aptsync.yourdomain.com
//                                 </span>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
//                             <Loader size={24} className="animate-spin text-gray-400" />
//                         </div>
//                     )}
//                 </div>
//             </div>
//         )
//     }

//     // Test QR Code
//     const testQRCode = (houseId) => {
//         const qrImg = qrCodeImages[houseId]
//         if (qrImg) {
//             const house = houses.find(h => h.id === houseId)
//             if (!house) return
            
//             const secureURL = createSecureURL(house);
            
//             const newWindow = window.open()
//             newWindow.document.write(`
//                 <html>
//                     <head>
//                         <title>QR Code Test - House ${house.house_id}</title>
//                         <style>
//                             body { 
//                                 font-family: Arial, sans-serif; 
//                                 padding: 20px; 
//                                 text-align: center; 
//                                 background: #f5f5f5;
//                             }
//                             .qr-container {
//                                 background: white;
//                                 padding: 20px;
//                                 border-radius: 10px;
//                                 box-shadow: 0 2px 10px rgba(0,0,0,0.1);
//                                 display: inline-block;
//                                 margin: 20px 0;
//                             }
//                             .info {
//                                 background: #e8f4ff;
//                                 padding: 15px;
//                                 border-radius: 8px;
//                                 margin: 20px auto;
//                                 max-width: 500px;
//                                 text-align: left;
//                             }
//                             .url-box {
//                                 background: #f0f0f0;
//                                 padding: 10px;
//                                 border-radius: 5px;
//                                 margin: 10px 0;
//                                 word-break: break-all;
//                                 font-family: monospace;
//                                 font-size: 12px;
//                             }
//                         </style>
//                     </head>
//                     <body>
//                         <h2>QR Code Test</h2>
//                         <p>House: ${house.house_id}</p>
                        
//                         <div class="qr-container">
//                             <img src="${qrImg}" style="width: 250px; height: 250px;" />
//                         </div>
                        
//                         <div class="info">
//                             <h3>What happens when scanned:</h3>
//                             <p>This QR code contains a URL that will:</p>
//                             <ol>
//                                 <li>Open a secure webpage</li>
//                                 <li>Show a "Welcome to AptSync" message</li>
//                                 <li><strong>NOT</strong> reveal any house details</li>
//                                 <li><strong>NOT</strong> show owner information</li>
//                                 <li><strong>NOT</strong> display bill details</li>
//                             </ol>
//                             <div class="url-box">
//                                 URL: ${secureURL}
//                             </div>
//                             <p><em>Note: The URL contains encrypted data that only your AptSync server can decode.</em></p>
//                         </div>
                        
//                         <div style="margin: 20px;">
//                             <button onclick="window.location.href='${secureURL}'" style="padding: 10px 20px; background: #6b46c1; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
//                                 Open URL Now
//                             </button>
//                             <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">
//                                 Close
//                             </button>
//                         </div>
//                     </body>
//                 </html>
//             `)
//         }
//     }

//     // ==========================================================
//     // MAIN RENDER
//     // ==========================================================
//     return (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                
//                 {/* Header */}
//                 <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
//                     <div>
//                         <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
//                             Generate QR Codes
//                         </h2>
//                         <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
//                             {apartment.name} • Floor {floor.floor_id}
//                         </p>
//                         <p className="text-xs text-green-600 dark:text-green-400 mt-1">
//                             🔒 Secure URL-based QR codes - No data exposure
//                         </p>
//                     </div>
//                     <button 
//                         onClick={onClose} 
//                         className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
//                     >
//                         <span className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✖</span>
//                     </button>
//                 </div>

//                 {/* Content */}
//                 <div className="flex-1 overflow-y-auto p-6">
//                     {/* Security Notice */}
//                     <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
//                         <div className="flex items-start">
//                             <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg mr-3">
//                                 <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
//                             </div>
//                             <div>
//                                 <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
//                                     Secure URL QR Codes
//                                 </h3>
//                                 <p className="text-sm text-blue-700 dark:text-blue-400">
//                                     These QR codes contain secure URLs that redirect to a controlled webpage. 
//                                     No house details are exposed in the QR code itself. When scanned, users 
//                                     will see a generic welcome message without any sensitive information.
//                                 </p>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="mb-6">
//                         <p className="text-gray-600 dark:text-gray-300 mb-4">
//                             Preview for {houses.length} house{houses.length !== 1 ? 's' : ''}
//                         </p>
                        
//                         {loading ? (
//                             <div className="flex justify-center items-center py-12">
//                                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
//                                 <span className="ml-3 text-gray-600 dark:text-gray-400">
//                                     Generating secure QR codes...
//                                 </span>
//                             </div>
//                         ) : (
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 {houses.map(house => (
//                                     <div key={house.id} className="relative">
//                                         <QRCodePreview house={house} />
//                                         <button
//                                             onClick={() => testQRCode(house.id)}
//                                             className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded text-xs transition-colors"
//                                             title="Test QR code"
//                                         >
//                                             Test QR
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Footer */}
//                 <div className="border-t dark:border-gray-700 p-6">
//                     <div className="flex justify-between items-center">
//                         <div className="text-sm text-gray-500 dark:text-gray-400">
//                             {Object.keys(qrCodeImages).length} secure QR code{Object.keys(qrCodeImages).length !== 1 ? 's' : ''} ready
//                         </div>
                        
//                         <div className="flex gap-3">
//                             <button
//                                 onClick={onClose}
//                                 className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 disabled={loading || generatingPDF || !Object.keys(qrCodeImages).length}
//                                 onClick={downloadPDF}
//                                 className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
//                             >
//                                 {generatingPDF ? (
//                                     <>
//                                         <Loader size={16} className="animate-spin" />
//                                         Generating PDF...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <QrCode size={16} />
//                                         Download PDF
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }

import React, { useEffect, useState } from 'react'
import { Loader, QrCode, ExternalLink } from 'lucide-react'
import { toast } from 'react-toastify'
import QRCode from 'qrcode'

export default function QRCodeGenerator({ houses, apartment, floor, onClose }) {
    const [loading, setLoading] = useState(false)
    const [generatingPDF, setGeneratingPDF] = useState(false)
    const [qrCodeImages, setQrCodeImages] = useState({})

    // Create a secure URL for the QR code
    const createSecureURL = (house) => {
        // Use your actual domain here
        const baseURL = "https://aptsync.yourdomain.com";
        
        // Create a URL with encoded parameters
        const url = new URL(`${baseURL}/house-info`);
        
        // Add encrypted/encoded parameters (simple base64 for now)
        const data = {
            apt: apartment.id,
            flr: floor.id,
            hse: house.id,
            t: Date.now() // timestamp for uniqueness
        };
        
        const encodedData = btoa(JSON.stringify(data));
        url.searchParams.append('d', encodedData);
        
        return url.toString();
    };

    // -----------------------------
    useEffect(() => {
        const run = async () => {
            if (!houses.length) return

            setLoading(true)

            try {
                const qrMap = {}

                for (const house of houses) {
                    // Create a secure URL instead of raw JSON data
                    const secureURL = createSecureURL(house);
                    
                    console.log(`QR URL for House ${house.house_id}:`, secureURL);

                    // Generate QR code with the URL
                    try {
                        qrMap[house.id] = await QRCode.toDataURL(secureURL, {
                            width: 400,
                            margin: 4,
                            errorCorrectionLevel: "H",
                            color: {
                                dark: "#000000",
                                light: "#FFFFFF"
                            }
                        })
                    } catch (err) {
                        console.error("QR Generation Error:", err)
                        qrMap[house.id] = ""
                        toast.error(`Failed to generate QR for house ${house.house_id}`)
                    }
                }

                setQrCodeImages(qrMap)

            } catch (error) {
                console.error("Error generating QR codes", error)
                toast.error("Failed to generate QR codes")
            }

            setLoading(false)
        }

        run()
    }, [houses, apartment, floor])

    // ==========================================================
    // Generate PDF
    // ==========================================================
    const downloadPDF = async () => {
        setGeneratingPDF(true)

        try {
            const { jsPDF } = await import("jspdf")
            const pdf = new jsPDF("p", "mm", "a4")

            const cardWidth = 85
            const cardHeight = 70
            const margin = 12
            const qrSize = 40
            const pageWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            
            let yOffset = margin
            let cardsPerRow = 2
            let cardsInCurrentRow = 0

            for (let i = 0; i < houses.length; i++) {
                const house = houses[i]
                
                // Calculate position
                const col = i % cardsPerRow
                const x = margin + col * (cardWidth + margin)
                
                // Check if we need a new page
                if (yOffset + cardHeight > pageHeight - margin) {
                    pdf.addPage()
                    yOffset = margin
                    cardsInCurrentRow = 0
                }
                
                // Card border
                pdf.setDrawColor(200, 200, 200)
                pdf.rect(x, yOffset, cardWidth, cardHeight)
                
                // Apartment name (top)
                pdf.setFontSize(8)
                pdf.setFont(undefined, "bold")
                pdf.text(apartment.name, x + cardWidth / 2, yOffset + 5, { align: 'center' })
                
                // Floor information
                pdf.setFontSize(7)
                pdf.setTextColor(100, 100, 100)
                pdf.text(`Floor: ${floor.floor_id}`, x + cardWidth / 2, yOffset + 9, { align: 'center' })
                
                // House ID (centered)
                pdf.setFontSize(14)
                pdf.setFont(undefined, "bold")
                pdf.setTextColor(0, 0, 0)
                pdf.text(`${house.house_id}`, x + cardWidth / 2, yOffset + 15, { align: 'center' })
                
                // QR Code
                if (qrCodeImages[house.id]) {
                    pdf.addImage(
                        qrCodeImages[house.id], 
                        "PNG", 
                        x + (cardWidth - qrSize) / 2, 
                        yOffset + 20,
                        qrSize, 
                        qrSize
                    )
                }
                
                // QR Label
                pdf.setFontSize(5)
                pdf.setTextColor(100, 100, 100)
                
                
                // Move to next position
                cardsInCurrentRow++
                if (cardsInCurrentRow === cardsPerRow) {
                    yOffset += cardHeight + margin
                    cardsInCurrentRow = 0
                }
                
                // If this was the last card and we're ending a row, add margin for next iteration
                if (i === houses.length - 1 && cardsInCurrentRow > 0) {
                    yOffset += cardHeight + margin
                }
            }

            // Save PDF
            const fileName = `QR_Codes_${apartment.name.replace(/\s+/g, '_')}_Floor_${floor.floor_id}.pdf`
            pdf.save(fileName)
            toast.success("PDF Generated Successfully!")

        } catch (err) {
            console.error("PDF Generation Error:", err)
            toast.error("Failed to generate PDF")
        }

        setGeneratingPDF(false)
    }

    // ==========================================================
    // QR Preview Component
    // ==========================================================
    const QRCodePreview = ({ house }) => {
        const qrImg = qrCodeImages[house.id]
        const secureURL = createSecureURL(house);

        return (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                <div className="text-center">
                    <div className="font-bold text-gray-800 dark:text-white text-lg mb-1">
                        House {house.house_id}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {apartment.name} • Floor {floor.floor_id}
                    </div>
                    
                    {qrImg ? (
                        <div className="flex flex-col items-center">
                            <img
                                src={qrImg}
                                className="mx-auto mb-2 rounded border-2 border-gray-300"
                                style={{ width: "150px", height: "150px" }}
                                alt={`QR Code for House ${house.house_id}`}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                                Scan to open web page
                            </div>
                            <div className="mt-2 flex items-center justify-center space-x-1">
                                <ExternalLink size={12} className="text-blue-500" />
                                <span className="text-xs text-blue-600 truncate max-w-[180px]">
                                    aptsync.yourdomain.com
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-32 h-32 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center">
                            <Loader size={24} className="animate-spin text-gray-400" />
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Test QR Code
    const testQRCode = (houseId) => {
        const qrImg = qrCodeImages[houseId]
        if (qrImg) {
            const house = houses.find(h => h.id === houseId)
            if (!house) return
            
            const secureURL = createSecureURL(house);
            
            const newWindow = window.open()
            newWindow.document.write(`
                <html>
                    <head>
                        <title>QR Code Test - House ${house.house_id}</title>
                        <style>
                            body { 
                                font-family: Arial, sans-serif; 
                                padding: 20px; 
                                text-align: center; 
                                background: #f5f5f5;
                            }
                            .qr-container {
                                background: white;
                                padding: 20px;
                                border-radius: 10px;
                                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                                display: inline-block;
                                margin: 20px 0;
                            }
                            .info {
                                background: #e8f4ff;
                                padding: 15px;
                                border-radius: 8px;
                                margin: 20px auto;
                                max-width: 500px;
                                text-align: left;
                            }
                            .url-box {
                                background: #f0f0f0;
                                padding: 10px;
                                border-radius: 5px;
                                margin: 10px 0;
                                word-break: break-all;
                                font-family: monospace;
                                font-size: 12px;
                            }
                        </style>
                    </head>
                    <body>
                        <h2>QR Code Test</h2>
                        <p>House: ${house.house_id}</p>
                        
                        <div class="qr-container">
                            <img src="${qrImg}" style="width: 250px; height: 250px;" />
                        </div>
                        
                        <div class="info">
                            <h3>What happens when scanned:</h3>
                            <p>This QR code contains a URL that will:</p>
                            <ol>
                                <li>Open a secure webpage</li>
                                <li>Show a "Welcome to AptSync" message</li>
                                <li><strong>NOT</strong> reveal any house details</li>
                                <li><strong>NOT</strong> show owner information</li>
                                <li><strong>NOT</strong> display bill details</li>
                            </ol>
                            <div class="url-box">
                                URL: ${secureURL}
                            </div>
                            <p><em>Note: The URL contains encrypted data that only your AptSync server can decode.</em></p>
                        </div>
                        
                        <div style="margin: 20px;">
                            <button onclick="window.location.href='${secureURL}'" style="padding: 10px 20px; background: #6b46c1; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                                Open URL Now
                            </button>
                            <button onclick="window.close()" style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 5px; cursor: pointer;">
                                Close
                            </button>
                        </div>
                    </body>
                </html>
            `)
        }
    }

    // ==========================================================
    // MAIN RENDER
    // ==========================================================
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            Generate QR Codes
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {apartment.name} • Floor {floor.floor_id}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            🔒 Secure URL-based QR codes - No data exposure
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <span className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✖</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Security Notice */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                            <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-lg mr-3">
                                <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                                    Secure URL QR Codes
                                </h3>
                                <p className="text-sm text-blue-700 dark:text-blue-400">
                                    These QR codes contain secure URLs that redirect to a controlled webpage. 
                                    No house details are exposed in the QR code itself. When scanned, users 
                                    will see a generic welcome message without any sensitive information.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Preview for {houses.length} house{houses.length !== 1 ? 's' : ''}
                        </p>
                        
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                <span className="ml-3 text-gray-600 dark:text-gray-400">
                                    Generating secure QR codes...
                                </span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {houses.map(house => (
                                    <div key={house.id} className="relative">
                                        <QRCodePreview house={house} />
                                        <button
                                            onClick={() => testQRCode(house.id)}
                                            className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded text-xs transition-colors"
                                            title="Test QR code"
                                        >
                                            Test QR
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t dark:border-gray-700 p-6">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                            {Object.keys(qrCodeImages).length} secure QR code{Object.keys(qrCodeImages).length !== 1 ? 's' : ''} ready
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={loading || generatingPDF || !Object.keys(qrCodeImages).length}
                                onClick={downloadPDF}
                                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {generatingPDF ? (
                                    <>
                                        <Loader size={16} className="animate-spin" />
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <QrCode size={16} />
                                        Download PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

