import sys

path = 'src/components/EduImageFrame.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """      {/* Dynamic technical thematic SVG illustration */}
      <div className="absolute inset-0 flex items-center justify-center p-4 transition-transform duration-500 group-hover:scale-105">
        {renderThemeGraphic()}
      </div>"""

replacement = """      {/* Dynamic technical thematic SVG illustration or Actual Image */}
      <div className={`absolute inset-0 flex items-center justify-center ${imageUrl ? 'p-0' : 'p-4'} transition-transform duration-500 group-hover:scale-105`}>
        {imageUrl ? (
          <img src={imageUrl} alt={label || subLabel || 'Image'} className="w-full h-full object-cover shadow-sm" />
        ) : (
          renderThemeGraphic()
        )}
      </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success")
else:
    print("Target not found")
