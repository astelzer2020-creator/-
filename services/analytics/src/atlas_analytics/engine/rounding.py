"""Boundary rounding: Decimal agorot → integer agorot.

Policy (docs/CODING_STANDARDS.md #3, docs/TESTING_STRATEGY.md tolerance table): monetary
quantities cross the engine boundary as integer agorot. Any Decimal money amount is rounded
to a whole agora **exactly once**, at the boundary, using ROUND_HALF_EVEN (banker's rounding).
Half-even is chosen because it is statistically unbiased over many roundings — repeated
half-up would drift bank-report totals upward by construction.
"""

from decimal import ROUND_HALF_EVEN, Decimal

_ONE_AGORA = Decimal("1")


def to_agorot(amount: Decimal) -> int:
    """Round a Decimal amount of agorot to an integer agora count, half-even.

    Examples: 2.5 → 2, 3.5 → 4, 818181.8181… → 818182, -181818.1818… → -181818.
    """
    return int(amount.quantize(_ONE_AGORA, rounding=ROUND_HALF_EVEN))
