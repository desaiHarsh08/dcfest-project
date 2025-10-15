# Archived Entities Fix Report

## Summary

Models with `isArchived` flag and `@SQLRestriction("is_archived=false")`:

1. **UserModel**
2. **ParticipantModel**
3. **CollegeModel**
4. **CollegeRepresentativeModel**
5. **CollegeParticipationModel**

## Critical Issues Found

### Problem

When entities are instantiated using `new EntityModel(id)`, the `@SQLRestriction` is bypassed, allowing archived entities to be used in business logic.

---

## Files Fixed

### ✅ 1. CollegeParticipationServiceImpl.java

**Issues Fixed:**

- Lines 66, 111, 119: Creating `CollegeModel` with just ID bypasses archive check
- Lines 65, 122: Creating `AvailableEventModel` with just ID

**Changes Made:**

- Added `@Autowired CollegeRepository` and `@Autowired AvailableEventRepository`
- In `createParticipation()`: Added validation to fetch college and available event from repository
- In `getByAvailableEvent()`: Fetch and validate available event exists
- In `getByCollege()`: Fetch and validate college exists and is not archived
- In `getByCollegeAndAvailableEvent()`: Fetch and validate both college and available event

**Status:** ✅ COMPLETED

---

## Files Requiring Fixes

### ⚠️ 2. ParticipantServicesImpl.java

**Lines Needing Fixes:**

1. **Line 111:** `new CollegeModel(participantDtos.get(0).getCollegeId())`

   - In `createParticipants()` method
   - College is already fetched at line 68, should reuse that

2. **Line 267:** `new CollegeModel(participantDto.getCollegeId())`

   - In `addParticipant()` method
   - Should fetch from repository and validate not archived

3. **Line 416-418:** Creating `CollegeModel` with just ID in `getParticipantByCollegeId()`

   ```java
   CollegeModel collegeModel = new CollegeModel();
   collegeModel.setId(collegeId);
   ```

   - Should use: `collegeRepository.findById(collegeId).orElseThrow(...)`

4. **Line 548:** `new CollegeModel(collegeId)` in `deleteParticipantsByCollegesId()`
   - Should fetch and validate college exists

**Recommended Fix:**

```java
// Replace all instances of new CollegeModel(id) with:
CollegeModel collegeModel = this.collegeRepository.findById(collegeId)
    .orElseThrow(() -> new ResourceNotFoundException("College not found or has been archived for id: " + collegeId));
```

---

### ⚠️ 3. CollegeRepresentativeServiceImpl.java

**Lines Needing Fixes:**

1. **Line 44:** `new CollegeModel(representativeDto.getCollegeId())`

   - In `updateRepresentative()` method
   - Should fetch from repository

2. **Line 88:** `new CollegeModel(dto.getCollegeId())`

   - In `mapToEntity()` helper method
   - Should fetch from repository

3. **Line 65:** Already correctly uses `collegeRepository.findById()` ✅

**Recommended Fix:**

```java
// In updateRepresentative():
CollegeModel college = this.collegeRepository.findById(representativeDto.getCollegeId())
    .orElseThrow(() -> new ResourceNotFoundException("College not found or has been archived"));
representative.setCollege(college);

// In mapToEntity():
CollegeModel college = this.collegeRepository.findById(dto.getCollegeId())
    .orElseThrow(() -> new ResourceNotFoundException("College not found or has been archived"));
representative.setCollege(college);
```

---

### ⚠️ 4. ScoreCardServicesImpl.java

**Lines Needing Fixes:**

1. **Line 108:** `new CollegeParticipationModel(scoreCardDto.getCollegeParticipationId())`

   - In `createScoreCard()` method
   - Should fetch from repository and validate not archived

2. **Line 243:** `new CollegeParticipationModel(collegeParticipationId)`
   - In `getByRoundAndCollege()` method
   - Should fetch from repository

**Recommended Fix:**

```java
// Add @Autowired CollegeParticipationRepository (if not already present)

// Replace instances with:
CollegeParticipationModel collegeParticipation = this.collegeParticipationRepository.findById(collegeParticipationId)
    .orElseThrow(() -> new ResourceNotFoundException("College participation not found or has been archived"));
```

---

### ⚠️ 5. ParticipantAttendanceServicesImp.java

**Lines Needing Fixes:**

1. **Line 229:** `new ParticipantModel(participantId)`

   - In `getParticipantAttendancesByParticipantId()` method
   - Should fetch from repository and validate not archived

2. **Line 518:** `new CollegeModel(collegeId)`
   - In `markParticipantAttendance()` method
   - Should fetch from repository

**Recommended Fix:**

```java
// For ParticipantModel:
ParticipantModel participant = this.participantRepository.findById(participantId)
    .orElseThrow(() -> new ResourceNotFoundException("Participant not found or has been archived"));

// For CollegeModel:
CollegeModel college = this.collegeRepository.findById(collegeId)
    .orElseThrow(() -> new ResourceNotFoundException("College not found or has been archived"));
```

---

### ⚠️ 6. CollegeServicesImpl.java

**Status:** Likely OK - uses `findById()` correctly

- Line 90: `collegeRepository.findById(id)` ✅
- Line 98: `collegeRepository.findByIcCode(icCode)` ✅
- Line 117: `collegeRepository.findById(collegeDto.getId())` ✅

**Note:** The `@SQLRestriction` should automatically filter archived records in these cases.

---

### ⚠️ 7. UserServicesImpl.java

**Status:** Likely OK - uses `findById()` correctly

- Line 139: `userRepository.findById(id)` ✅
- Line 131: `userRepository.findByEmail(email)` ✅
- Line 147: `userRepository.findById(userDto.getId())` ✅

**Note:** The `@SQLRestriction` should automatically filter archived records in these cases.

---

## Additional Locations to Check

### AuthController.java

- Line 104, 201: Creates empty `CollegeModel()` - appears to be OK as it's immediately populated from repository

### Other Services

Search for these patterns across all service files:

```bash
grep -r "new CollegeModel(" backend/dc-fest/src/main/java/com/dcfest/services/
grep -r "new UserModel(" backend/dc-fest/src/main/java/com/dcfest/services/
grep -r "new ParticipantModel(" backend/dc-fest/src/main/java/com/dcfest/services/
grep -r "new CollegeRepresentativeModel(" backend/dc-fest/src/main/java/com/dcfest/services/
grep -r "new CollegeParticipationModel(" backend/dc-fest/src/main/java/com/dcfest/services/
```

---

## Testing Recommendations

After applying fixes, test these scenarios:

1. **Archive a College** → Try to create participants for that college (should fail)
2. **Archive a User** → Try to login with that user (should fail)
3. **Archive a Participant** → Try to mark attendance (should fail)
4. **Archive a CollegeRepresentative** → Try to update representative (should fail)
5. **Archive a CollegeParticipation** → Try to create score card (should fail)

---

## Implementation Priority

1. **HIGH PRIORITY:** ParticipantServicesImpl (most critical, affects registration)
2. **HIGH PRIORITY:** ScoreCardServicesImpl (affects scoring)
3. **MEDIUM:** CollegeRepresentativeServiceImpl
4. **MEDIUM:** ParticipantAttendanceServicesImp
5. **LOW:** CollegeServicesImpl & UserServicesImpl (already using repository methods)

---

## Next Steps

1. Apply fixes to remaining files (2-5)
2. Run compilation check
3. Run tests if available
4. Manual QA testing with archived entities
5. Update any integration tests
