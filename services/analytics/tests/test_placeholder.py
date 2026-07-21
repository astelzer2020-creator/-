"""Placeholder suite for ATL-007 — proves pytest wiring; real engine tests land in M1."""

import atlas_analytics


def test_package_importable() -> None:
    assert atlas_analytics.__version__ == "0.1.0"
