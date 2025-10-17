"""
MongoDB Atlas SSL Connection Fix Script
This script helps diagnose and fix SSL/TLS connection issues with MongoDB Atlas.
"""

import ssl
import certifi
import sys
from pathlib import Path

def check_ssl_configuration():
    """Check SSL/TLS configuration and provide diagnostics"""
    print("=" * 60)
    print("🔧 MongoDB Atlas SSL/TLS Diagnostics")
    print("=" * 60)
    
    # Check Python version
    print(f"\n✓ Python Version: {sys.version}")
    
    # Check SSL version
    print(f"✓ SSL Version: {ssl.OPENSSL_VERSION}")
    
    # Check certifi
    try:
        ca_bundle = certifi.where()
        print(f"✓ Certifi CA Bundle: {ca_bundle}")
        
        # Check if file exists
        if Path(ca_bundle).exists():
            print(f"  ✓ CA bundle file exists")
            file_size = Path(ca_bundle).stat().st_size
            print(f"  ✓ CA bundle size: {file_size:,} bytes")
        else:
            print(f"  ❌ CA bundle file NOT found!")
    except Exception as e:
        print(f"❌ Certifi error: {e}")
    
    # Check if we can create SSL context
    try:
        context = ssl.create_default_context(cafile=certifi.where())
        print(f"✓ SSL Context created successfully")
        print(f"  - Protocol: {context.protocol}")
        print(f"  - Check hostname: {context.check_hostname}")
        print(f"  - Verify mode: {context.verify_mode}")
    except Exception as e:
        print(f"❌ SSL Context error: {e}")
    
    print("\n" + "=" * 60)
    print("💡 SOLUTIONS FOR COMMON ISSUES:")
    print("=" * 60)
    
    print("\n1️⃣ SSL HANDSHAKE ERRORS:")
    print("   Solution: Use certifi.where() in your MongoDB connection")
    print("   Code: tlsCAFile=certifi.where()")
    
    print("\n2️⃣ IP NOT WHITELISTED:")
    print("   Solution: Add your IP to MongoDB Atlas")
    print("   Steps:")
    print("   a. Go to: https://cloud.mongodb.com")
    print("   b. Select your cluster → Network Access")
    print("   c. Click 'Add IP Address'")
    print("   d. Choose 'Add Current IP Address'")
    print("   e. Or use 0.0.0.0/0 for development (allows all IPs)")
    
    print("\n3️⃣ OUTDATED CERTIFICATES:")
    print("   Solution: Update certifi package")
    print("   Command: pip install --upgrade certifi")
    
    print("\n4️⃣ WINDOWS SPECIFIC ISSUES:")
    print("   Solution: Use certifi instead of system certificates")
    print("   This is already implemented in mongodb.py!")
    
    print("\n" + "=" * 60)
    print("📝 MONGODB CONNECTION STRING FORMAT:")
    print("=" * 60)
    print("\nCorrect format:")
    print("mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority")
    print("\nMake sure to include:")
    print("  ✓ mongodb+srv:// (not mongodb://)")
    print("  ✓ Your username and password")
    print("  ✓ Your cluster URL")
    print("  ✓ ?retryWrites=true&w=majority at the end")
    
    print("\n" + "=" * 60)
    print("🎯 RECOMMENDED CONNECTION PARAMETERS:")
    print("=" * 60)
    print("""
AsyncIOMotorClient(
    MONGODB_URI,
    serverSelectionTimeoutMS=5000,
    tls=True,
    tlsAllowInvalidCertificates=False,
    tlsCAFile=certifi.where()  # ← This fixes Windows SSL issues!
)
""")
    
    print("\n" + "=" * 60)
    print("✅ NEXT STEPS:")
    print("=" * 60)
    print("\n1. Ensure your MongoDB connection uses tlsCAFile=certifi.where()")
    print("2. Add your IP to MongoDB Atlas Network Access")
    print("3. Restart your FastAPI server")
    print("4. The connection should work without manual IP whitelisting each time!")
    print("\n" + "=" * 60)

if __name__ == "__main__":
    check_ssl_configuration()
