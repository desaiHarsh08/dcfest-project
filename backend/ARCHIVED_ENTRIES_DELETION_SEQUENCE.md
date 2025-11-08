# 🗑️ Deletion Sequence for Archived Entries

## 📋 **Models with `isArchived` Flag**

Based on analysis of all models, the following 5 tables have the `isArchived` flag:

| #   | Model                        | Table Name                | Has Relationships                                       |
| --- | ---------------------------- | ------------------------- | ------------------------------------------------------- |
| 1   | `UserModel`                  | `users`                   | ❌ No (Independent)                                     |
| 2   | `CollegeModel`               | `colleges`                | ✅ Yes (Parent to many)                                 |
| 3   | `ParticipantModel`           | `participants`            | ✅ Yes (References colleges, referenced by attendances) |
| 4   | `CollegeRepresentativeModel` | `college_representatives` | ✅ Yes (References colleges)                            |
| 5   | `CollegeParticipationModel`  | `college_participations`  | ✅ Yes (References colleges, referenced by scorecards)  |

---

## 🔗 **Foreign Key Dependency Tree**

```
colleges (CollegeModel)
    ├── participants (ParticipantModel)
    │   ├── participant_attendances (NO isArchived flag, but depends on participants)
    │   └── event_participant (ManyToMany join table)
    ├── college_representatives (CollegeRepresentativeModel)
    └── college_participations (CollegeParticipationModel)
        └── score_cards (NO isArchived flag, but depends on college_participations)
            └── score_parameters (NO isArchived flag, but depends on score_cards) ⚠️

users (UserModel)
    └── (No dependencies - independent table)
```

---

## ⚠️ **Critical Tables WITHOUT `isArchived` Flag (But Depend on Archived Entities)**

These tables don't have `isArchived` but reference entities that do:

| Table                     | References                                                 | Impact                                                      |
| ------------------------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| `score_parameters`        | `score_cards` (FK: score_card_id_fk)                       | ⚠️ Must be deleted FIRST before score_cards                 |
| `score_cards`             | `college_participations` (FK: college_participation_id_fk) | ⚠️ Must be deleted when college_participations are archived |
| `participant_attendances` | `participants` (FK: participant_id_fk)                     | ⚠️ Must be deleted when participants are archived           |
| `promoted_rounds`         | `participants` (FK: participant_id_fk)                     | ⚠️ Must be deleted when participants are archived           |
| `event_participant`       | `participants` (FK: participant_id)                        | ⚠️ Join table - must clean when participants are archived   |

---

## 🎯 **CORRECT DELETION SEQUENCE** (Foreign Key Safe)

### **Phase 1: Delete Child Tables First (Bottom-Up Approach)**

```sql
-- Step 1: Delete score_parameters (child of score_cards)
DELETE FROM score_parameters
WHERE score_card_id_fk IN (
    SELECT id FROM score_cards
    WHERE college_participation_id_fk IN (
        SELECT id FROM college_participations WHERE is_archived = true
    )
);

-- Step 2: Delete score_cards for archived college_participations
DELETE FROM score_cards
WHERE college_participation_id_fk IN (
    SELECT id FROM college_participations WHERE is_archived = true
);

-- Step 3: Delete participant_attendances for archived participants
DELETE FROM participant_attendances
WHERE participant_id_fk IN (
    SELECT id FROM participants WHERE is_archived = true
);

-- Step 4: Delete promoted_rounds for archived participants
DELETE FROM promoted_rounds
WHERE participant_id_fk IN (
    SELECT id FROM participants WHERE is_archived = true
);

-- Step 5: Delete event_participant (ManyToMany) for archived participants
DELETE FROM event_participant
WHERE participant_id IN (
    SELECT id FROM participants WHERE is_archived = true
);

-- Step 6: Delete archived college_participations
DELETE FROM college_participations WHERE is_archived = true;

-- Step 6: Delete archived college_representatives
DELETE FROM college_representatives WHERE is_archived = true;

-- Step 7: Delete archived participants
DELETE FROM participants WHERE is_archived = true;

-- Step 8: Delete archived colleges
DELETE FROM colleges WHERE is_archived = true;

-- Step 9: Delete archived users (independent)
DELETE FROM users WHERE is_archived = true;
```

---

## 📊 **Detailed Step-by-Step Execution Plan**

### ✅ **Step 1: Clean Score Parameters**

**Target:** `score_parameters` (No isArchived flag)  
**Reason:** References `score_cards` which references archived `college_participations`  
**Query:**

```sql
DELETE FROM score_parameters
WHERE score_card_id_fk IN (
    SELECT id FROM score_cards
    WHERE college_participation_id_fk IN (
        SELECT id FROM college_participations WHERE is_archived = true
    )
);
```

**Expected Result:** Removes all score parameter records for archived participations

---

### ✅ **Step 2: Clean Score Cards**

**Target:** `score_cards` (No isArchived flag)  
**Reason:** References `college_participations` which has archived entries  
**Query:**

```sql
DELETE FROM score_cards
WHERE college_participation_id_fk IN (
    SELECT id FROM college_participations WHERE is_archived = true
);
```

**Expected Result:** Removes all scoring records for archived participations

---

### ✅ **Step 3: Clean Participant Attendances**

**Target:** `participant_attendances` (No isArchived flag)  
**Reason:** References `participants` which has archived entries  
**Query:**

```sql
DELETE FROM participant_attendances
WHERE participant_id_fk IN (
    SELECT id FROM participants WHERE is_archived = true
);
```

**Expected Result:** Removes all attendance records for archived participants

---

### ✅ **Step 4: Clean Event-Participant Join Table**

**Target:** `event_participant` (ManyToMany join table)  
**Reason:** References `participants` which has archived entries  
**Query:**

```sql
DELETE FROM event_participant
WHERE participant_id IN (
    SELECT id FROM participants WHERE is_archived = true
);
```

**Expected Result:** Removes event associations for archived participants

---

### ✅ **Step 5: Delete Archived College Participations**

**Target:** `college_participations`  
**Has isArchived:** ✅ Yes  
**Query:**

```sql
DELETE FROM college_participations WHERE is_archived = true;
```

**Expected Result:** Removes archived participation records

---

### ✅ **Step 6: Delete Archived College Representatives**

**Target:** `college_representatives`  
**Has isArchived:** ✅ Yes  
**Query:**

```sql
DELETE FROM college_representatives WHERE is_archived = true;
```

**Expected Result:** Removes archived college representative records

---

### ✅ **Step 7: Delete Archived Participants**

**Target:** `participants`  
**Has isArchived:** ✅ Yes  
**Query:**

```sql
DELETE FROM participants WHERE is_archived = true;
```

**Expected Result:** Removes archived participant records

---

### ✅ **Step 8: Delete Archived Colleges**

**Target:** `colleges`  
**Has isArchived:** ✅ Yes  
**Query:**

```sql
DELETE FROM colleges WHERE is_archived = true;
```

**Expected Result:** Removes archived college records

---

### ✅ **Step 9: Delete Archived Users** (Independent - Can Run Anytime)

**Target:** `users`  
**Has isArchived:** ✅ Yes  
**No Dependencies:** Can be run in parallel or first  
**Query:**

```sql
DELETE FROM users WHERE is_archived = true;
```

**Expected Result:** Removes archived user records

---

## 🚀 **Complete Deletion Script (Copy-Paste Ready)**

```sql
-- ============================================
-- ARCHIVED ENTRIES DELETION SCRIPT
-- Execute in this EXACT order to respect FK constraints
-- ============================================

-- Phase 1: Clean dependent tables (no isArchived flag)
-- --------------------------------------------------------

-- 1. Clean score_parameters (FIRST - child of score_cards)
DELETE FROM score_parameters
WHERE score_card_id_fk IN (
    SELECT id FROM score_cards
    WHERE college_participation_id_fk IN (
        SELECT id FROM college_participations WHERE is_archived = true
    )
);

-- 2. Clean score_cards
DELETE FROM score_cards
WHERE college_participation_id_fk IN (
    SELECT id FROM college_participations WHERE is_archived = true
);

-- 3. Clean participant_attendances
DELETE FROM participant_attendances
WHERE participant_id_fk IN (
    SELECT id FROM participants WHERE is_archived = true
);

-- 4. Clean event_participant join table
DELETE FROM event_participant
WHERE participant_id IN (
    SELECT id FROM participants WHERE is_archived = true
);


-- Phase 2: Delete archived entries (bottom-up)
-- --------------------------------------------------------

-- 5. Delete archived college_participations
DELETE FROM college_participations WHERE is_archived = true;

-- 6. Delete archived college_representatives
DELETE FROM college_representatives WHERE is_archived = true;

-- 7. Delete archived participants
DELETE FROM participants WHERE is_archived = true;

-- 8. Delete archived colleges
DELETE FROM colleges WHERE is_archived = true;

-- 9. Delete archived users (independent - can run anytime)
DELETE FROM users WHERE is_archived = true;


-- ============================================
-- VERIFICATION QUERIES (Run after deletion)
-- ============================================

-- Check for any remaining archived entries
SELECT 'users' as table_name, COUNT(*) as archived_count FROM users WHERE is_archived = true
UNION ALL
SELECT 'colleges', COUNT(*) FROM colleges WHERE is_archived = true
UNION ALL
SELECT 'participants', COUNT(*) FROM participants WHERE is_archived = true
UNION ALL
SELECT 'college_representatives', COUNT(*) FROM college_representatives WHERE is_archived = true
UNION ALL
SELECT 'college_participations', COUNT(*) FROM college_participations WHERE is_archived = true;

-- Expected result: All counts should be 0
```

---

## 🔍 **Pre-Deletion Verification Queries**

Run these BEFORE deletion to see what will be deleted:

```sql
-- Count archived entries in each table
SELECT 'users' as table_name, COUNT(*) as archived_count FROM users WHERE is_archived = true
UNION ALL
SELECT 'colleges', COUNT(*) FROM colleges WHERE is_archived = true
UNION ALL
SELECT 'participants', COUNT(*) FROM participants WHERE is_archived = true
UNION ALL
SELECT 'college_representatives', COUNT(*) FROM college_representatives WHERE is_archived = true
UNION ALL
SELECT 'college_participations', COUNT(*) FROM college_participations WHERE is_archived = true;

-- Count dependent records that will be deleted
SELECT 'score_parameters (dependent)', COUNT(*) FROM score_parameters
WHERE score_card_id_fk IN (
    SELECT id FROM score_cards
    WHERE college_participation_id_fk IN (
        SELECT id FROM college_participations WHERE is_archived = true
    )
);

SELECT 'score_cards (dependent)', COUNT(*) FROM score_cards
WHERE college_participation_id_fk IN (
    SELECT id FROM college_participations WHERE is_archived = true
);

SELECT 'participant_attendances (dependent)', COUNT(*) FROM participant_attendances
WHERE participant_id_fk IN (
    SELECT id FROM participants WHERE is_archived = true
);

SELECT 'event_participant (dependent)', COUNT(*) FROM event_participant
WHERE participant_id IN (
    SELECT id FROM participants WHERE is_archived = true
);
```

---

## 📝 **Alternative: Cascading Delete Approach**

If you want to set up automatic cascading deletes (one-time setup):

```sql
-- WARNING: This modifies your database schema
-- Add CASCADE to foreign keys (example for score_cards)

ALTER TABLE score_cards
DROP FOREIGN KEY FK_score_cards_college_participation;

ALTER TABLE score_cards
ADD CONSTRAINT FK_score_cards_college_participation
FOREIGN KEY (college_participation_id_fk)
REFERENCES college_participations(id)
ON DELETE CASCADE;

-- Repeat for other tables with FK dependencies
```

**Pros:** Automatic cleanup  
**Cons:**

- Requires schema migration
- Less control over what gets deleted
- May cause unexpected deletions

---

## ⚙️ **Using JPA/Hibernate to Delete (Code Approach)**

If you prefer to delete via Java code:

```java
@Service
@Transactional
public class ArchivedDataCleanupService {

    @Autowired
    private EntityManager entityManager;

    public void deleteAllArchivedEntries() {
        // Step 1: Delete score_parameters (child of score_cards)
        entityManager.createNativeQuery(
            "DELETE FROM score_parameters WHERE score_card_id_fk IN " +
            "(SELECT id FROM score_cards WHERE college_participation_id_fk IN " +
            "(SELECT id FROM college_participations WHERE is_archived = true))"
        ).executeUpdate();

        // Step 2: Delete score_cards for archived participations
        entityManager.createNativeQuery(
            "DELETE FROM score_cards WHERE college_participation_id_fk IN " +
            "(SELECT id FROM college_participations WHERE is_archived = true)"
        ).executeUpdate();

        // Step 3: Delete participant_attendances for archived participants
        entityManager.createNativeQuery(
            "DELETE FROM participant_attendances WHERE participant_id_fk IN " +
            "(SELECT id FROM participants WHERE is_archived = true)"
        ).executeUpdate();

        // Step 4: Delete event_participant join table
        entityManager.createNativeQuery(
            "DELETE FROM event_participant WHERE participant_id IN " +
            "(SELECT id FROM participants WHERE is_archived = true)"
        ).executeUpdate();

        // Step 5: Delete archived college_participations
        entityManager.createNativeQuery(
            "DELETE FROM college_participations WHERE is_archived = true"
        ).executeUpdate();

        // Step 6: Delete archived college_representatives
        entityManager.createNativeQuery(
            "DELETE FROM college_representatives WHERE is_archived = true"
        ).executeUpdate();

        // Step 7: Delete archived participants
        entityManager.createNativeQuery(
            "DELETE FROM participants WHERE is_archived = true"
        ).executeUpdate();

        // Step 8: Delete archived colleges
        entityManager.createNativeQuery(
            "DELETE FROM colleges WHERE is_archived = true"
        ).executeUpdate();

        // Step 9: Delete archived users
        entityManager.createNativeQuery(
            "DELETE FROM users WHERE is_archived = true"
        ).executeUpdate();
    }
}
```

---

## 🛡️ **Safety Recommendations**

### ✅ **Before Deletion:**

1. **Backup your database**

   ```bash
   mysqldump -u username -p database_name > backup_before_cleanup.sql
   ```

2. **Run verification queries** to see what will be deleted

3. **Test in development/staging first**

4. **Consider soft-delete instead** (keep isArchived = true, just exclude from queries)

### ⚠️ **Why Delete vs Keep Archived?**

| Approach            | Pros                                                | Cons                                         |
| ------------------- | --------------------------------------------------- | -------------------------------------------- |
| **Keep Archived**   | Historical data preserved, can restore, audit trail | Database grows, queries slower, more storage |
| **Delete Archived** | Faster queries, less storage, cleaner DB            | Data loss, cannot restore, no audit trail    |

### 💡 **Recommended Hybrid Approach**

1. Keep archived for 1 year
2. Export archived data to separate archive database
3. Delete from production database
4. Keep backups for compliance

---

## 📊 **Summary Table**

| Step | Table                     | Action                   | Reason                                                |
| ---- | ------------------------- | ------------------------ | ----------------------------------------------------- |
| 1    | `score_parameters`        | DELETE dependent records | No isArchived, but child of score_cards               |
| 2    | `score_cards`             | DELETE dependent records | No isArchived, but references archived participations |
| 3    | `participant_attendances` | DELETE dependent records | No isArchived, but references archived participants   |
| 4    | `event_participant`       | DELETE dependent records | Join table references archived participants           |
| 5    | `college_participations`  | DELETE archived          | Has isArchived flag                                   |
| 6    | `college_representatives` | DELETE archived          | Has isArchived flag                                   |
| 7    | `participants`            | DELETE archived          | Has isArchived flag                                   |
| 8    | `colleges`                | DELETE archived          | Has isArchived flag (parent)                          |
| 9    | `users`                   | DELETE archived          | Has isArchived flag (independent)                     |

---

## 🎯 **Quick Reference: Execution Order**

```
1. score_parameters (dependent cleanup - FIRST!)
2. score_cards (dependent cleanup)
3. participant_attendances (dependent cleanup)
4. event_participant (dependent cleanup)
5. college_participations (archived entries)
6. college_representatives (archived entries)
7. participants (archived entries)
8. colleges (archived entries)
9. users (archived entries)
```

**Remember:** Always go from **child to parent** (bottom-up) to avoid foreign key violations!

---

**Status:** ✅ READY TO EXECUTE  
**Risk Level:** ⚠️ HIGH (Permanent data deletion)  
**Recommendation:** 🛡️ **BACKUP FIRST, TEST IN DEV/STAGING**
