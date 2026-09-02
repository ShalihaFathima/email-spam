"""
Spam Detection System using UCI SMS Spam Collection Dataset
Uses TF-IDF and Multinomial Naive Bayes classifier
"""

import pandas as pd
import re
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import os

# ============================================================================
# 1. LOAD THE DATASET
# ============================================================================
print("=" * 70)
print("SPAM DETECTION SYSTEM")
print("=" * 70)

# Check if dataset exists
dataset_path = "SMSSpamCollection"
if not os.path.exists(dataset_path):
    print(f"❌ ERROR: Dataset file '{dataset_path}' not found!")
    print(f"📍 Please place 'SMSSpamCollection' file in: {os.getcwd()}")
    exit(1)

print("\n📂 Loading dataset...")
df = pd.read_csv(dataset_path, sep='\t', names=['label', 'text'])

print(f"✅ Dataset loaded successfully!")
print(f"📊 Total messages: {len(df)}")
print(f"📊 Dataset shape: {df.shape}")

# ============================================================================
# 2. PRINT FIRST 5 ROWS
# ============================================================================
print("\n" + "=" * 70)
print("FIRST 5 ROWS OF DATASET")
print("=" * 70)
print(df.head())

print("\n📈 Label distribution:")
print(df['label'].value_counts())

# ============================================================================
# 3. TEXT PREPROCESSING
# ============================================================================
print("\n" + "=" * 70)
print("PREPROCESSING TEXT")
print("=" * 70)

def preprocess_text(text):
    """
    Preprocess text by:
    - Converting to lowercase
    - Removing punctuation using regex
    """
    # Convert to lowercase
    text = text.lower()
    
    # Remove punctuation and special characters (keep only alphanumeric and spaces)
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

# Apply preprocessing to all messages
print("Processing messages...")
df['text_processed'] = df['text'].apply(preprocess_text)

print("✅ Preprocessing complete!")
print("\nSample preprocessing:")
for i in range(3):
    print(f"\nOriginal:\n  {df['text'].iloc[i]}")
    print(f"Processed:\n  {df['text_processed'].iloc[i]}")

# ============================================================================
# 4. CONVERT LABELS: ham → 0, spam → 1
# ============================================================================
print("\n" + "=" * 70)
print("CONVERTING LABELS")
print("=" * 70)

label_map = {'ham': 0, 'spam': 1}
df['label_encoded'] = df['label'].map(label_map)

print("Label mapping:")
print(f"  ham → 0")
print(f"  spam → 1")
print(f"\nLabel distribution after encoding:")
print(df['label_encoded'].value_counts())

# ============================================================================
# 5. CONVERT TEXT TO NUMERICAL FEATURES USING TF-IDF
# ============================================================================
print("\n" + "=" * 70)
print("CONVERTING TEXT TO TF-IDF FEATURES")
print("=" * 70)

tfidf_vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')
X = tfidf_vectorizer.fit_transform(df['text_processed'])
y = df['label_encoded']

print(f"✅ TF-IDF vectorization complete!")
print(f"📊 Feature matrix shape: {X.shape}")
print(f"   - Number of messages: {X.shape[0]}")
print(f"   - Number of features: {X.shape[1]}")

# ============================================================================
# 6. SPLIT DATA INTO TRAINING AND TESTING (80/20)
# ============================================================================
print("\n" + "=" * 70)
print("SPLITTING DATA (80/20 TRAIN/TEST)")
print("=" * 70)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"✅ Data split complete!")
print(f"📊 Training set size: {X_train.shape[0]} ({(X_train.shape[0]/X.shape[0]*100):.1f}%)")
print(f"📊 Testing set size: {X_test.shape[0]} ({(X_test.shape[0]/X.shape[0]*100):.1f}%)")

print(f"\nTraining set label distribution:")
print(f"  Ham: {sum(y_train == 0)} ({sum(y_train == 0)/len(y_train)*100:.1f}%)")
print(f"  Spam: {sum(y_train == 1)} ({sum(y_train == 1)/len(y_train)*100:.1f}%)")

print(f"\nTesting set label distribution:")
print(f"  Ham: {sum(y_test == 0)} ({sum(y_test == 0)/len(y_test)*100:.1f}%)")
print(f"  Spam: {sum(y_test == 1)} ({sum(y_test == 1)/len(y_test)*100:.1f}%)")

# ============================================================================
# 7. TRAIN MULTINOMIAL NAIVE BAYES MODEL
# ============================================================================
print("\n" + "=" * 70)
print("TRAINING MULTINOMIAL NAIVE BAYES MODEL")
print("=" * 70)

model = MultinomialNB()
model.fit(X_train, y_train)

print("✅ Model training complete!")

# ============================================================================
# 7.5 SAVE MODEL AND VECTORIZER
# ============================================================================
print("\n" + "=" * 70)
print("SAVING MODEL AND VECTORIZER")
print("=" * 70)

# Save trained model
with open('model.pkl', 'wb') as f:
    pickle.dump(model, f)
print("✅ Model saved as 'model.pkl'")

# Save TF-IDF vectorizer
with open('vectorizer.pkl', 'wb') as f:
    pickle.dump(tfidf_vectorizer, f)
print("✅ Vectorizer saved as 'vectorizer.pkl'")

# ============================================================================
# 8. EVALUATE MODEL AND PRINT METRICS
# ============================================================================
print("\n" + "=" * 70)
print("MODEL EVALUATION")
print("=" * 70)

# Make predictions
y_pred = model.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)

print(f"\n🎯 MODEL ACCURACY: {accuracy:.4f} ({accuracy*100:.2f}%)")

# Additional metrics
print("\n" + "-" * 70)
print("DETAILED CLASSIFICATION REPORT")
print("-" * 70)
print(classification_report(y_test, y_pred, target_names=['Ham', 'Spam']))

print("-" * 70)
print("CONFUSION MATRIX")
print("-" * 70)
cm = confusion_matrix(y_test, y_pred)
print(f"                Predicted")
print(f"                Ham    Spam")
print(f"Actual Ham      {cm[0][0]:5d}   {cm[0][1]:5d}")
print(f"       Spam     {cm[1][0]:5d}   {cm[1][1]:5d}")

# ============================================================================
# 9. CREATE PREDICT_EMAIL FUNCTION
# ============================================================================
print("\n" + "=" * 70)
print("DEFINING PREDICT_EMAIL FUNCTION")
print("=" * 70)

def predict_email(text):
    """
    Predict if an email/SMS is spam or not.
    
    Parameters:
        text (str): The email/SMS text to classify
    
    Returns:
        str: "Spam" or "Not Spam"
    """
    # Step 1: Apply same preprocessing (lowercase + remove punctuation)
    processed_text = preprocess_text(text)
    
    # Step 2: Transform using vectorizer
    text_vectorized = tfidf_vectorizer.transform([processed_text])
    
    # Step 3: Predict using model
    prediction = model.predict(text_vectorized)[0]
    probability = model.predict_proba(text_vectorized)[0]
    
    # Get confidence
    confidence = max(probability) * 100
    
    # Step 4: Return "Spam" or "Not Spam"
    result = "Spam" if prediction == 1 else "Not Spam"
    
    return result, confidence, list(probability)

print("✅ predict_email() function created!")
print("   Function signature: predict_email(text)")
print("   Returns: (prediction, confidence_percentage, probabilities)")

# ============================================================================
# 9.5 TEST PREDICT_EMAIL FUNCTION
# ============================================================================
print("\n" + "=" * 70)
print("TESTING PREDICT_EMAIL FUNCTION")
print("=" * 70)

test_email = "free bitcoin offer now"
result, confidence, probs = predict_email(test_email)

print(f"\n📧 Test Email: '{test_email}'")
print(f"   Prediction: {result}")
print(f"   Confidence: {confidence:.2f}%")
print(f"   Probabilities: Not Spam={probs[0]:.4f}, Spam={probs[1]:.4f}")

# ============================================================================
# 10. TEST WITH SAMPLE MESSAGES
# ============================================================================
print("\n" + "=" * 70)
print("TESTING WITH SAMPLE MESSAGES")
print("=" * 70)

sample_messages = [
    "You have won a free iPhone! Click here to claim your prize!",
    "Hey, how are you doing? Let's catch up this weekend.",
    "Congratulations! You're a winner. Claim your reward now!",
    "The meeting is scheduled for tomorrow at 2 PM."
]

for msg in sample_messages:
    # Use the predict_email function
    result, confidence, probs = predict_email(msg)
    
    print(f"\n📧 Message: {msg}")
    print(f"   Classification: {result} (Confidence: {confidence:.2f}%)")

print("\n" + "=" * 70)
print("SPAM DETECTION SYSTEM COMPLETE!")
print("=" * 70)
