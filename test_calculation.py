
from app.calculations import calculate_vat

result = calculate_vat(100, 0.19)

print("Net amount:", result["net_amount"])
print("VAT rate:", result["vat_rate"])
print("VAT amount:", result["vat_amount"])
print("Gross amount:", result["gross_amount"])

print("------------------------")

# Example 2: 50 euros with 7% VAT
result2 = calculate_vat(50, 0.07)

print("Example 2")
print("Net amount:", result2["net_amount"])
print("VAT amount:", result2["vat_amount"])
print("Gross amount:", result2["gross_amount"])
