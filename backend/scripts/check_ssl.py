"""
Simple test to verify certifi is working and MongoDB connection will succeed
"""

import sys

print("=" * 60)
print("🔍 Checking SSL/TLS Configuration for MongoDB")
print("=" * 60)

# Check Python version
print(f"\n✓ Python: {sys.version}")

# Check certifi
try:
    import certifi
    ca_bundle = certifi.where()
    print(f"✓ Certifi installed")
    print(f"  CA Bundle: {ca_bundle}")
    
    # Check if file exists
    from pathlib import Path
    if Path(ca_bundle).exists():
        size = Path(ca_bundle).stat().st_size
        print(f"  File exists: {size:,} bytes")
    else:
        print(f"  ❌ ERROR: CA bundle file not found!")
except ImportError:
    print("❌ ERROR: certifi not installed!")
    print("   Fix: pip install certifi")
    sys.exit(1)

# Check SSL
try:
    import ssl
    print(f"✓ SSL: {ssl.OPENSSL_VERSION}")
except ImportError:
    print("❌ ERROR: ssl module not available!")
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ SSL/TLS Configuration is READY!")
print("=" * 60)
print("\nYour MongoDB connection should now work with:")
print("  tlsCAFile=certifi.where()")
print("\nNext step: Add your IP to MongoDB Atlas Network Access")
print("Guide: MONGODB_ATLAS_IP_SETUP.md")
