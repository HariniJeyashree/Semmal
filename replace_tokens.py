import os
import re

directory = r"d:\antigravity projects\ai-recruiter\frontend\src"

replacements = {
    # Backgrounds
    r"bg-slate-950": "bg-transparent",
    r"bg-slate-900": "bg-[#3A0A11]",
    r"bg-slate-800": "bg-[#5C141F]",
    r"bg-gray-900": "bg-[#3A0A11]",
    r"bg-gray-800": "bg-[#5C141F]",
    
    # Borders
    r"border-slate-800": "border-[#D9A646]/20",
    r"border-slate-700": "border-[#D9A646]/30",
    r"border-gray-800": "border-[#D9A646]/20",
    
    # Text
    r"text-slate-400": "text-[#F5EFE6]/70",
    r"text-slate-200": "text-[#F5EFE6]",
    r"text-slate-300": "text-[#F5EFE6]/90",
    r"text-gray-400": "text-[#F5EFE6]/70",
    r"text-gray-200": "text-[#F5EFE6]",
    r"text-gray-300": "text-[#F5EFE6]/90",
    r"text-white": "text-[#F5EFE6]",
    
    # Primary/Accents (Indigo/Teal -> Gold)
    r"text-indigo-400": "text-[#D9A646]",
    r"text-indigo-500": "text-[#D9A646]",
    r"text-indigo-600": "text-[#D9A646]",
    r"border-indigo-500": "border-[#D9A646]",
    r"bg-indigo-500": "bg-[#D9A646]",
    r"bg-indigo-600": "bg-gradient-to-r from-[#D9A646] to-[#F6D88A]",
    r"hover:bg-indigo-500": "hover:from-[#F6D88A] hover:to-[#D9A646]",
    r"hover:bg-indigo-600": "hover:from-[#F6D88A] hover:to-[#D9A646]",
    r"from-indigo-400": "from-[#D9A646]",
    r"to-cyan-400": "to-[#F6D88A]",
    r"from-indigo-500": "from-[#D9A646]",
    r"to-cyan-500": "to-[#F6D88A]",
    
    # Rings
    r"ring-indigo-500": "ring-[#D9A646]",
    r"focus:ring-indigo-500": "focus:ring-[#D9A646]",
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for pattern, replacement in replacements.items():
        content = re.sub(pattern, replacement, content)
        
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            process_file(os.path.join(root, file))

print("Done replacing tokens.")
