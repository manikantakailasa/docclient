"use client"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Star } from "lucide-react"

type Medicine = {
  id: string
  name: string
  category: string
  commonStrengths: string[]
  isFavorite: boolean
}

const MEDICINES: Medicine[] = [
  { id: "m1", name: "Amoxicillin", category: "Antibiotic", commonStrengths: ["250mg", "500mg"], isFavorite: true },
  { id: "m2", name: "Atorvastatin", category: "Statin", commonStrengths: ["10mg", "20mg", "40mg"], isFavorite: true },
  { id: "m3", name: "Metformin", category: "Antidiabetic", commonStrengths: ["500mg", "850mg"], isFavorite: false },
  { id: "m4", name: "Amlodipine", category: "Antihypertensive", commonStrengths: ["5mg", "10mg"], isFavorite: false },
  { id: "m5", name: "Aspirin", category: "Antiplatelet", commonStrengths: ["75mg", "150mg"], isFavorite: true },
  { id: "m6", name: "Gabapentin", category: "Anticonvulsant", commonStrengths: ["100mg", "300mg"], isFavorite: false },
]

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  "aria-label"?: string
}

export default function PrescriptionAutocomplete({ value, onChange, placeholder, "aria-label": ariaLabel }: Props) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value.length > 0) {
      const matches = MEDICINES.filter((m) => m.name.toLowerCase().includes(value.toLowerCase()))
        .sort((a, b) => {
          if (a.isFavorite && !b.isFavorite) return -1
          if (!a.isFavorite && b.isFavorite) return 1
          return a.name.localeCompare(b.name)
        })
        .slice(0, 8)
      setFilteredMedicines(matches)
      setShowDropdown(matches.length > 0)
    } else {
      setShowDropdown(false)
    }
  }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectMedicine = (medicine: Medicine) => {
    onChange(medicine.name)
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        onFocus={() => {
          if (value.length > 0 && filteredMedicines.length > 0) {
            setShowDropdown(true)
          }
        }}
      />
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg"
          role="listbox"
        >
          <div className="max-h-60 overflow-y-auto p-1">
            {filteredMedicines.map((med) => (
              <button
                key={med.id}
                type="button"
                onClick={() => selectMedicine(med)}
                className="flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                role="option"
              >
                <div className="flex-1">
                  <div className="font-medium">{med.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {med.category} • {med.commonStrengths.join(", ")}
                  </div>
                </div>
                {med.isFavorite && <Star className="h-3 w-3 fill-alert text-alert" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
