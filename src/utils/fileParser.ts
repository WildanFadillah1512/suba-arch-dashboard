import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export interface ParsedData {
  data: any[]
  errors: string[]
}

/**
 * Parse file based on extension - supports CSV and XLSX
 */
export async function parseFile(file: File): Promise<ParsedData> {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel(file)
  } else if (extension === 'csv') {
    return parseCSV(file)
  } else {
    throw new Error(`Unsupported file format: ${extension}. Please use CSV or XLSX.`)
  }
}

/**
 * Parse CSV file using PapaParse
 */
function parseCSV(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    Papa.parse(file as any, {
      header: true,
      skipEmptyLines: 'greedy', // Skip empty lines even inside quoted fields
      quoteChar: '"',
      escapeChar: '"',
      transformHeader: (header: string) => header.trim(), // Trim whitespace from headers
      complete: (results: any) => {
        resolve({
          data: results.data as any[],
          errors: results.errors.map((e: any) => e.message)
        })
      },
      error: (error: any) => {
        reject(error)
      }
    })
  })
}

/**
 * Parse Excel file using xlsx library
 */
function parseExcel(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get first sheet
        const firstSheetName = workbook.SheetNames[0]
        if (!firstSheetName) {
          reject(new Error('Excel file has no sheets'))
          return
        }
        
        const worksheet = workbook.Sheets[firstSheetName]
        if (!worksheet) {
          reject(new Error('Could not read worksheet'))
          return
        }
        
        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          defval: ''
        })
        
        resolve({
          data: jsonData as any[],
          errors: []
        })
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Detect file type from File object
 */
export function getFileType(file: File): 'csv' | 'xlsx' | 'unknown' {
  const extension = file.name.split('.').pop()?.toLowerCase()
  
  if (extension === 'csv') return 'csv'
  if (extension === 'xlsx' || extension === 'xls') return 'xlsx'
  return 'unknown'
}
