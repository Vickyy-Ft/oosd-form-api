# Test Forms Guide

This document provides guidance on testing the Accessible Form Assistant with various government forms.

## Creating Test Forms

For initial testing, you can create simple mock forms or use real government forms.

### Mock Test Form Template

Create a simple test form with these fields:

```
GOVERNMENT OF INDIA
Sample Application Form

1. Full Name: _______________________________
   (Enter your full name as per Aadhaar)

2. Date of Birth: ___/___/______
   (DD/MM/YYYY format)

3. Aadhaar Number: ____ ____ ____
   (12-digit Aadhaar number)

4. Mobile Number: ______________
   (10-digit mobile number)

5. Address: _________________________________
   _________________________________________
   _________________________________________

6. Category: 
   [ ] General
   [ ] OBC
   [ ] SC
   [ ] ST

7. Purpose of Application: __________________
   _________________________________________

Required Documents:
• Aadhaar Card Copy
• Address Proof
• Passport Size Photo
```

### Tips for Creating Test Images

1. **Clear Image**:
   - Print the form or display on screen
   - Take photo in good lighting
   - Keep camera steady
   - Ensure all text is readable

2. **Test Variations**:
   - Straight-on photo
   - Slightly angled (10-15 degrees)
   - With handwritten text in some fields
   - Different lighting conditions
   - Different image formats (JPG, PNG)

## Real Government Forms for Testing

### Recommended Forms to Test

1. **Aadhaar Enrollment/Update Form**
   - Available at: https://uidai.gov.in/
   - Good for testing: name, address, date fields

2. **Passport Application Form**
   - Available at: https://www.passportindia.gov.in/
   - Good for testing: multiple pages, complex fields

3. **PAN Card Application Form**
   - Available at: https://www.onlineservices.nsdl.com/
   - Good for testing: choice fields, structured data

4. **Voter ID Application Form**
   - Available at state election commission websites
   - Good for testing: simple structure

5. **Bank Account Opening Form**
   - Available at bank websites
   - Good for testing: signature fields, multiple sections

## Test Scenarios

### Basic Functionality Tests

#### Test 1: Simple Clear Form
- **Form**: Mock form with 5-7 fields
- **Photo**: Clear, straight-on, good lighting
- **Expected**: All fields extracted correctly
- **Language**: Test in all three languages

#### Test 2: Angled Form
- **Form**: Same mock form
- **Photo**: Angled 10-15 degrees
- **Expected**: Most fields extracted, some may need clarification

#### Test 3: Handwritten Fields
- **Form**: Form with some handwritten text
- **Photo**: Clear photo
- **Expected**: System should recognize handwritten text or prompt for clarification

#### Test 4: Complex Form
- **Form**: Multi-section government form
- **Photo**: Clear photo
- **Expected**: All sections identified, fields grouped logically

### Voice Interface Tests

#### Test 5: Voice Input - Clear Speech
- **Scenario**: Speak clearly in selected language
- **Expected**: Accurate transcription on first attempt

#### Test 6: Voice Input - Noisy Environment
- **Scenario**: Background noise present
- **Expected**: May need 2-3 attempts, correction flow works

#### Test 7: Voice Input - Different Accents
- **Scenario**: Test with different regional accents
- **Expected**: System handles variations

### Multi-Language Tests

#### Test 8: Tamil Language Flow
- **Form**: Simple form
- **Language**: Tamil
- **Expected**: 
  - Instructions in Tamil
  - TTS speaks Tamil
  - STT understands Tamil input
  - Output in Tamil

#### Test 9: Hindi Language Flow
- **Form**: Simple form
- **Language**: Hindi
- **Expected**: Complete flow in Hindi

#### Test 10: English Language Flow
- **Form**: Simple form
- **Language**: English
- **Expected**: Complete flow in English

### Error Handling Tests

#### Test 11: Large File
- **File**: Image > 10MB
- **Expected**: Error message, file rejected

#### Test 12: Invalid File Type
- **File**: .txt, .doc file
- **Expected**: Error message, file rejected

#### Test 13: Blurry Image
- **Photo**: Out of focus image
- **Expected**: Extraction may fail, helpful error message

#### Test 14: No Form in Image
- **Photo**: Random image without form
- **Expected**: Error message indicating no form found

#### Test 15: Network Disconnection
- **Scenario**: Disconnect internet during processing
- **Expected**: Clear offline message, state preserved

### Accessibility Tests

#### Test 16: Screen Reader (TalkBack)
- **Device**: Android with TalkBack enabled
- **Expected**: 
  - All elements announced
  - Navigation possible via swipes
  - Can complete entire flow without sight

#### Test 17: Screen Reader (VoiceOver)
- **Device**: iOS with VoiceOver enabled
- **Expected**: Same as Test 16

#### Test 18: Keyboard Navigation
- **Device**: Desktop with keyboard only
- **Expected**: 
  - Can tab through all elements
  - Can activate buttons with Enter/Space
  - Focus indicators visible

#### Test 19: Touch Targets
- **Device**: Mobile device
- **Expected**: All buttons easy to tap, no mis-taps

### Output Generation Tests

#### Test 20: PDF Output
- **Form**: Pre-mapped form (if available)
- **Expected**: 
  - Filled PDF generated
  - All fields populated correctly
  - Downloadable

#### Test 21: Text Summary Output
- **Form**: Non-mapped form
- **Expected**:
  - Text summary generated
  - All fields and answers listed
  - Required documents listed
  - Downloadable

## Expected Results by Form Type

### Simple Forms (3-5 fields)
- **Extraction Accuracy**: 95%+
- **Processing Time**: 10-15 seconds
- **Voice Completion Time**: 2-3 minutes

### Medium Forms (6-10 fields)
- **Extraction Accuracy**: 90%+
- **Processing Time**: 15-25 seconds
- **Voice Completion Time**: 4-6 minutes

### Complex Forms (10+ fields)
- **Extraction Accuracy**: 85%+
- **Processing Time**: 25-40 seconds
- **Voice Completion Time**: 8-12 minutes

## Known Limitations

1. **Very Small Text**: Text smaller than 8pt may not extract well
2. **Colored Backgrounds**: Forms with dark or colored backgrounds may be challenging
3. **Table Structures**: Complex tables may be misinterpreted
4. **Checkboxes**: Visual checkbox state detection not supported (user must state choice verbally)
5. **Signatures**: Electronic signature not supported (note: field for reference only)
6. **Multi-Page Forms**: Each page should be uploaded separately

## Test Data Samples

### Sample Test Answers (English)

```
Name: Ramesh Kumar
Date of Birth: 15 March 1985
Aadhaar Number: 1234 5678 9012
Mobile: 9876543210
Address: 123 MG Road, Bangalore, Karnataka, 560001
Category: General
Purpose: Applying for disability certificate
```

### Sample Test Answers (Tamil)

```
பெயர்: ரமேஷ் குமார்
பிறந்த தேதி: 15 மார்ச் 1985
ஆதார் எண்: 1234 5678 9012
கைபேசி: 9876543210
முகவரி: 123 எம்ஜி சாலை, பெங்களூர், கர்நாடகா, 560001
```

### Sample Test Answers (Hindi)

```
नाम: रमेश कुमार
जन्म तिथि: 15 मार्च 1985
आधार नंबर: 1234 5678 9012
मोबाइल: 9876543210
पता: 123 एमजी रोड, बैंगलोर, कर्नाटक, 560001
```

## Reporting Issues

When reporting extraction or voice recognition issues, include:

1. Form type and source
2. Image quality (clear/blurry, straight/angled)
3. Language used
4. Specific field that failed
5. Expected vs actual result
6. Screenshot if possible

## Performance Benchmarks

Track these metrics during testing:

- **Extraction Time**: Should be < 30 seconds
- **Simplification Time**: Should be < 20 seconds per field
- **TTS Latency**: Should be < 2 seconds
- **STT Latency**: Should be < 5 seconds
- **Total Time to Complete**: Should be < 10 minutes for typical 5-field form

## Success Criteria

A successful test run should achieve:

- ✅ 90%+ field extraction accuracy
- ✅ 95%+ voice transcription accuracy
- ✅ All navigation buttons functional
- ✅ No crashes or unhandled errors
- ✅ Downloadable output generated
- ✅ Complete accessibility with screen reader

---

**Note**: Real government forms should only be tested with dummy data. Never enter real personal information during testing.
