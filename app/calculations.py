
from decimal import Decimal, ROUND_HALF_UP


def calculate_vat(net_amount, vat_rate):

    # Convert inputs into Decimal values
    net = Decimal(str(net_amount))
    rate = Decimal(str(vat_rate))

    # Calculate VAT
    vat = (net * rate).quantize(
        Decimal("0.01"),
        rounding=ROUND_HALF_UP
    )

    # Calculate gross amount
    gross = net + vat

    # Return all calculated values
    return {
        "net_amount": net,
        "vat_rate": rate,
        "vat_amount": vat,
        "gross_amount": gross
    }

