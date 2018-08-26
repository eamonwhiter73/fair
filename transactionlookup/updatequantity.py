import sys
#print sys.argv[1]

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

# Use a service account
cred = credentials.Certificate('./fairstarterprototype-a854b35e957a.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

