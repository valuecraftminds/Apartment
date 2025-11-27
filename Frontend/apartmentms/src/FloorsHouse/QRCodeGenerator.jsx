import React, { useEffect, useState } from 'react'
import { Loader, QrCode } from 'lucide-react'
import api from '../api/axios'
import { toast } from 'react-toastify'
import QRCode from 'qrcode'

export default function QRCodeGenerator({ houses, apartment, floor, onClose }) {
    const [loading, setLoading] = useState(false)
    const [generatingPDF, setGeneratingPDF] = useState(false)
    const [assignedBills, setAssignedBills] = useState({})
    const [qrCodeImages, setQrCodeImages] = useState({})
    const [housetypes, setHousetypes] = useState([])
    const [houseOwners, setHouseOwners] = useState({})

    // -----------------------------
    // Load House Types
    // -----------------------------
    const loadHouseTypes = async () => {
        try {
            const result = await api.get(`/housetype?apartment_id=${apartment.id}`)
            if (result.data.success && Array.isArray(result.data.data)) {
                setHousetypes(result.data.data)
                return result.data.data
            }
            return []
        } catch (err) {
            console.error('Error loading house types:', err)
            toast.error('Failed to load house types')
            return []
        }
    }

    // -----------------------------
    // Load Owner by house
    // -----------------------------
    const loadHouseOwner = async (houseId) => {
        try {
            const res = await api.get(
                `/houseowner/by-house?house_id=${houseId}&apartment_id=${apartment.id}`
            )
            if (res.data.success) {
                return res.data.data
            }
            return null
        } catch (err) {
            if (err.response?.status !== 404) {
                console.error(`Error loading owner for house ${houseId}`, err)
            }
            return null
        }
    }

    // -----------------------------
    // Load ALL house owners
    // -----------------------------
    const loadAllHouseOwners = async (housesList) => {
        const owners = {}

        await Promise.all(
            housesList.map(async (h) => {
                const owner = await loadHouseOwner(h.id)
                if (owner) owners[h.id] = owner
            })
        )

        setHouseOwners(owners)
        return owners
    }

    // -----------------------------
    // Load Bills
    // -----------------------------
    const loadAssignedBillsForHouse = async (houseId) => {
        try {
            const res = await api.get(
                `/bill-assignments/house-details?house_id=${houseId}&apartment_id=${apartment.id}`
            )
            if (res.data.success && Array.isArray(res.data.data)) {
                return res.data.data
                    .filter(b => b.bill_name?.trim())
                    .map(b => b.bill_name)
            }
            return []
        } catch (err) {
            console.error(`Error loading bills for house ${houseId}`)
            return []
        }
    }

    // -----------------------------
    // Helper → Split text for PDF
    // -----------------------------
    const splitTextIntoLines = (text, maxWidth, pdf) => {
        if (!text) return ['']
        const words = text.split(' ')
        const lines = []
        let current = words[0]

        for (let i = 1; i < words.length; i++) {
            if (pdf.getTextWidth(current + ' ' + words[i]) < maxWidth) {
                current += ' ' + words[i]
            } else {
                lines.push(current)
                current = words[i]
            }
        }
        lines.push(current)

        return lines
    }

    const splitText = (text, max) =>
        text?.length > max ? text.substring(0, max - 3) + '...' : text
    // -----------------------------
    useEffect(() => {
        const run = async () => {
            if (!houses.length) return

            setLoading(true)

            try {
                // Load Types
                const typeList = await loadHouseTypes()

                // Load Owners
                const owners = await loadAllHouseOwners(houses)

                const billsMap = {}
                const qrMap = {}
                const ownersMap = {}

                for (const house of houses) {

                    const [owner,bills] = await Promise.all([
                        loadHouseOwner(house.id),
                        loadAssignedBillsForHouse(house.id)
                    ])
                      
                    ownersMap[house.id] = owner
                    billsMap[house.id] = bills

                    const type = typeList.find(t => t.id === house.housetype_id)

                    // Full QR payload
                    const qrData = {
                        house_id: house.house_id,
                        apartment: apartment.name,
                        floor: floor.floor_id,
                        status: house.status,
                        house_type: type?.name || "N/A",
                        owner_name: owner?.name || "No Owner Assigned",
                        owner_nic: owner?.NIC || "N/A",
                        assigned_bills: bills.length ? bills.join(', ') : 'No bills assigned',
                        assigned_bills_type: bills?.billtype || "N/A",
                        square_feet: type?.sqrfeet || "N/A",
                        rooms: type?.rooms || "N/A",
                        bathrooms: type?.bathrooms || "N/A",

                        // IDs for fresh API fetch on scan
                        scan_type: "house_details",
                        // house_db_id: h.id,
                        // apartment_db_id: apartment.id,
                        generated_at: new Date().toISOString()
                    }

                    // Generate QR
                    try {
                        qrMap[house.id] = await QRCode.toDataURL(JSON.stringify(qrData), {
                            width: 300,
                            margin: 2,
                            errorCorrectionLevel: "M",
                        })
                    } catch (err) {
                        console.error("QR Gen Error:", err)
                        qrMap[house.id] = ""
                    }
                }

                setAssignedBills(billsMap)
                setQrCodeImages(qrMap)

            } catch (error) {
                console.error("Error preparing data", error)
                toast.error("Failed to generate QR data")
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

            const cardW = 85
            const cardH = 70
            const margin = 12
            const qrSize = 35
            const pageW = pdf.internal.pageSize.getWidth()
            const pageH = pdf.internal.pageSize.getHeight()
            let yOffset = margin

            for (let i = 0; i < houses.length; i++) {
                const h = houses[i]
                const type = housetypes.find(t => t.id === h.housetype_id)
                const owner = houseOwners[h.id]

                const col = i % 2
                const x = margin + col * (cardW + margin)

                if (i % 2 === 0 && i !== 0) {
                    yOffset += cardH + margin
                    if (yOffset + cardH > pageH - margin) {
                        pdf.addPage()
                        yOffset = margin
                    }
                }

                // Card Box
                pdf.setDrawColor(200, 200, 200)
                pdf.rect(x, yOffset, cardW, cardH)

                // Titles
                pdf.setFontSize(9)
                pdf.setFont(undefined, "bold")
                pdf.text(apartment.name, x + cardW / 2, yOffset + 6, { align: 'center' })

                pdf.setFontSize(7)
                pdf.text(`Floor: ${floor.floor_id}`, x + cardW / 2, yOffset + 10, { align: 'center' })

                // House ID
                pdf.setFontSize(11)
                pdf.text(h.house_id, x + cardW / 2, yOffset + 16, { align: 'center' })

                // QR
                if (qrCodeImages[h.id]) {
                    pdf.addImage(qrCodeImages[h.id], "PNG", x + (cardW - qrSize) / 2, yOffset + 30, qrSize, qrSize)
                }

                // Bills
                pdf.setFontSize(5)
            }

            pdf.save(
                `QR_Codes_${apartment.name.replace(/\s+/g, '_')}_Floor_${floor.floor_id}.pdf`
            )
            toast.success("PDF Generated Successfully!")

        } catch (err) {
            console.error(err)
            toast.error("Failed to generate PDF")
        }

        setGeneratingPDF(false)
    }

    // ==========================================================
    // QR Preview Component
    // ==========================================================
    const QRCodePreview = ({ house }) => {
        const bills = assignedBills[house.id] || []
        const qrImg = qrCodeImages[house.id]
        const type = housetypes.find(t => t.id === house.housetype_id)
        const owner = houseOwners[house.id]

        return (
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                <div className="text-center">
                    <div className="font-bold text-gray-800 dark:text-white text-lg mb-1">
                        {house.house_id}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {apartment.name} • Floor {floor.floor_id}
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                        <div className="flex justify-between">
                            <span>Type: <strong>{type?.name || "N/A"}</strong></span>
                            <span>Status: <strong>{house.status}</strong></span>
                        </div>

                        {owner && (
                            <div className="mt-1 text-left">
                                <div className="font-semibold">Owner:</div>
                                <div>{owner.name}</div>
                                <div className="text-xs">NIC: {owner.NIC}</div>
                            </div>
                        )}
                    </div>

                    {qrImg ? (
                        <img
                            src={qrImg}
                            className="mx-auto mb-2 rounded border"
                            style={{ width: "100px", height: "100px" }}
                        />
                    ) : (
                        <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                            <Loader size={20} className="animate-spin" />
                        </div>
                    )}

                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-2">
                        <div className="font-semibold">Assigned Bills:</div>
                        <div className="mt-1 max-h-16 overflow-y-auto text-left">
                            {bills.length
                                ? bills.map((b, i) => <div key={i}>• {b}</div>)
                                : "No bills assigned"}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ==========================================================
    // MAIN RENDER
    // ==========================================================
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Generate QR Codes
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-600">✖</button>
                </div>

                {/* Preview */}
                <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Preview for {houses.length} selected house{houses.length !== 1 ? "s" : ""}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto p-2">
                        {houses.map(h => (
                            <QRCodePreview key={h.id} house={h} />
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 border-t">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                        The QR codes contain house, owner & bill information.
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading || generatingPDF || !Object.keys(qrCodeImages).length}
                            onClick={downloadPDF}
                            className="px-4 py-2 rounded bg-purple-600 text-white flex items-center gap-2"
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
    )
}
