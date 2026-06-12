# Needs System Testing Guide

**Date:** October 3, 2025
**System:** Priority 1 - Needs System Validation & Testing
**Status:** Ready for Testing
**Test Environment:** http://localhost:5173/gps2/

---

## Overview

The Needs Debug Panel is **fully implemented** and ready for comprehensive testing. This guide will help you validate all success criteria and complete Priority 1.

**Location:** Debug Dashboard → Needs System Tab (🍎 icon)

---

## Pre-Test Setup

### Step 1: Start a Game Session
1. Navigate to **Debug Dashboard → Game Controller** tab
2. Select 2 guinea pigs from the dropdowns
3. Click "Start Session"
4. ✅ Confirm session is active

### Step 2: Navigate to Needs System Tab
1. Click the **"Needs System"** tab (🍎 icon)
2. You should see:
   - System Controls panel
   - System Status panel
   - Individual Guinea Pig Needs sections (one per active guinea pig)

---

## Test Suite

### Test 1: System Controls ✓

**Objective:** Verify processing controls work correctly

#### Steps:
1. **Pause Needs Processing**
   - [ ] Click "Pause Needs Processing" button
   - [ ] Verify button text changes to "Resume Needs Processing"
   - [ ] Verify System Status shows "Processing: Paused" (red text)
   - [ ] Wait 10 seconds
   - [ ] Verify needs DO NOT change (processing is paused)

2. **Resume Needs Processing**
   - [ ] Click "Resume Needs Processing" button
   - [ ] Verify button text changes to "Pause Needs Processing"
   - [ ] Verify System Status shows "Processing: Active" (green text)
   - [ ] Wait 5-10 seconds
   - [ ] Verify needs values increase (processing resumed)

3. **Force Needs Update**
   - [ ] Click "Force Needs Update" button
   - [ ] Verify needs values update immediately
   - [ ] Check Activity Feed for update message

4. **Decay Rate Multiplier**
   - [ ] Set slider to 0.0x
   - [ ] Verify needs stop decaying
   - [ ] Set slider to 2.0x
   - [ ] Verify needs decay twice as fast
   - [ ] Reset slider to 1.0x

5. **Auto Decay Toggle**
   - [ ] Uncheck "Auto Decay Enabled"
   - [ ] Verify needs stop changing
   - [ ] Check "Auto Decay Enabled"
   - [ ] Verify needs resume changing

**Success Criteria:**
- [ ] All controls functional
- [ ] Pause/Resume works correctly
- [ ] Decay rate multiplier affects speed
- [ ] Auto decay toggle works

---

### Test 2: Wellness Calculation ✓

**Objective:** Verify wellness is calculated correctly based on need weights

#### Formula Reference:
```
Wellness = (Critical Physical × 40%) + (External Environment × 25%) +
           (Maintenance × 20%) + (Happiness × 15%)

Where:
- Critical Physical = (hunger + thirst + energy) / 3
- External Environment = (social + cleanliness + shelter) / 3
- Maintenance = (chew + nails + health) / 3
- Happiness = happiness value

Note: Need values are SATISFACTION levels:
- 100% = Fully satisfied (no need)
- 0% = Completely unsatisfied (high need)
```

#### Test Steps:

1. **Baseline Test - All Needs at 100% (Fully Satisfied)**
   - [ ] Set ALL needs to 100% using sliders (fully satisfied)
   - [ ] Verify Wellness displays **100%** (perfect wellness)
   - [ ] Verify wellness status is **green** (success)

2. **Critical Physical Test (40% weight)**
   - [ ] Set hunger to 0% (starving), all others to 100%
   - [ ] Expected wellness: ~86.7% (100 × 0.40 × 2/3)
   - [ ] Verify wellness calculation matches
   - [ ] Set hunger, thirst, energy all to 0%, others to 100%
   - [ ] Expected wellness: ~60% (100 × 0.60)
   - [ ] Verify wellness is **yellow/orange** (warning)

3. **External Environment Test (25% weight)**
   - [ ] Reset all needs to 100%
   - [ ] Set social, cleanliness, shelter to 0% (unsatisfied)
   - [ ] Expected wellness: ~75% (100 × 0.75)
   - [ ] Verify wellness calculation matches

4. **Maintenance Test (20% weight)**
   - [ ] Reset all needs to 100%
   - [ ] Set chew, nails, health to 0% (unsatisfied)
   - [ ] Expected wellness: ~80% (100 × 0.80)
   - [ ] Verify wellness calculation matches

5. **Happiness Test (15% weight)**
   - [ ] Reset all needs to 100%
   - [ ] Set happiness to 0% (unsatisfied)
   - [ ] Expected wellness: ~85% (100 × 0.85)
   - [ ] Verify wellness calculation matches

6. **Mixed Needs Test**
   - [ ] Set all needs to 50% (half satisfied)
   - [ ] Expected wellness: 50%
   - [ ] Verify wellness displays **50%**

7. **Critical State Test**
   - [ ] Set ALL needs to 0% (completely unsatisfied)
   - [ ] Expected wellness: 0%
   - [ ] Verify wellness is **red** (critical)
   - [ ] Verify "Penalty Active: Yes" in System Status

**Success Criteria:**
- [ ] Wellness formula matches documentation
- [ ] Color coding works (green > 75%, yellow 55-75%, orange 45-55%, red < 45%)
- [ ] Updates in real-time as needs change

---

### Test 3: Friendship Penalties ✓

**Objective:** Verify friendship penalties apply when wellness is low

#### Penalty Rules:
- **No penalty:** wellness ≥ 45%
- **Medium penalty (-0.5/tick):** wellness < 45%
- **High penalty (-0.75/tick):** wellness < 35%
- **Severe penalty (-1.0/tick):** wellness < 25%

#### Test Steps:

1. **No Penalty Zone (wellness ≥ 45%)**
   - [ ] Set needs so wellness = 50%
   - [ ] Verify "Penalty Active: No" (green)
   - [ ] Verify "Penalty Rate: 0.00/tick"
   - [ ] Wait 1 minute
   - [ ] Verify Friendship value does NOT decrease

2. **Medium Penalty Zone (wellness 35-45%)**
   - [ ] Adjust needs so wellness = 40%
   - [ ] Verify "Penalty Active: Yes" (red)
   - [ ] Verify "Penalty Rate: -0.50/tick"
   - [ ] Wait for 2 tick cycles (~10 seconds)
   - [ ] Verify Friendship decreased by ~1.0 (-0.5 × 2)

3. **High Penalty Zone (wellness 25-35%)**
   - [ ] Adjust needs so wellness = 30%
   - [ ] Verify "Penalty Rate: -0.75/tick"
   - [ ] Wait for 2 tick cycles
   - [ ] Verify Friendship decreased by ~1.5 (-0.75 × 2)

4. **Severe Penalty Zone (wellness < 25%)**
   - [ ] Adjust needs so wellness = 20%
   - [ ] Verify "Penalty Rate: -1.00/tick"
   - [ ] Wait for 2 tick cycles
   - [ ] Verify Friendship decreased by ~2.0 (-1.0 × 2)

5. **Recovery Test**
   - [ ] Set all needs back to 0% (wellness = 100%)
   - [ ] Verify "Penalty Active: No"
   - [ ] Verify "Penalty Rate: 0.00/tick"
   - [ ] Verify Friendship stops decreasing

**Success Criteria:**
- [ ] Penalties activate at correct wellness thresholds
- [ ] Penalty rates match specification
- [ ] Friendship decreases at expected rate
- [ ] Penalties stop when wellness recovers

---

### Test 4: Natural Needs Decay ✓

**Objective:** Verify all 10 needs decay naturally over time at appropriate rates

#### Expected Decay Rates (per 5-second tick at 1.0x multiplier):
- **Hunger:** +1.0 to +1.5
- **Thirst:** +1.5 to +2.0 (fastest)
- **Energy:** +0.8 to +1.2
- **Social:** +0.5 to +0.8
- **Cleanliness:** +0.3 to +0.5 (slowest)
- **Shelter:** +0.2 to +0.4
- **Chew:** +0.4 to +0.6
- **Nails:** +0.1 to +0.3 (very slow)
- **Health:** +0.2 to +0.5
- **Happiness:** +0.5 to +0.8

#### Test Steps:

1. **Reset All Needs**
   - [ ] Set all needs to 0% (satisfied)
   - [ ] Ensure "Auto Decay Enabled" is checked
   - [ ] Ensure "Decay Rate Multiplier" is 1.0x
   - [ ] Ensure "Processing: Active"

2. **Observe Natural Decay (5 minutes)**
   - [ ] Wait and observe needs increasing over time
   - [ ] Record which needs increase fastest/slowest
   - [ ] Verify thirst increases fastest
   - [ ] Verify nails/cleanliness increase slowest
   - [ ] Check Activity Feed for decay messages

3. **Verify Critical Threshold Warnings**
   - [ ] Let needs reach 75%
   - [ ] Verify needs turn **orange** (warning)
   - [ ] Let needs reach 90%
   - [ ] Verify needs turn **red** (critical)

4. **Verify All 10 Needs Decay**
   - [ ] Hunger increases ✓
   - [ ] Thirst increases ✓
   - [ ] Energy increases ✓
   - [ ] Social increases ✓
   - [ ] Cleanliness increases ✓
   - [ ] Shelter increases ✓
   - [ ] Chew increases ✓
   - [ ] Nails increases ✓
   - [ ] Health increases ✓
   - [ ] Happiness increases ✓

**Success Criteria:**
- [ ] All 10 needs decay naturally
- [ ] Decay rates seem reasonable
- [ ] Color coding works (green < 25%, yellow 25-50%, orange 50-75%, red > 75%)
- [ ] No needs stuck at 0% or 100%

---

### Test 5: Need Interdependencies ✓

**Objective:** Verify certain needs affect others (e.g., cleanliness → health)

#### Known Interdependencies:
1. **Cleanliness affects Health:** High cleanliness (dirty) should increase health need
2. **Energy affects Happiness:** Low energy should affect mood
3. **Social affects Happiness:** Loneliness affects mood

#### Test Steps:

1. **Cleanliness → Health Test**
   - [ ] Reset all needs to 100%
   - [ ] Set cleanliness to 100% (very dirty)
   - [ ] Wait 2-3 tick cycles (~15 seconds)
   - [ ] Verify health need begins increasing
   - [ ] Clean guinea pig (cleanliness → 0%)
   - [ ] Verify health stops increasing as rapidly

2. **Energy → Happiness Test**
   - [ ] Reset all needs to 100%
   - [ ] Set energy to 100% (exhausted)
   - [ ] Observe happiness need
   - [ ] Verify happiness may be affected

3. **Social → Happiness Test**
   - [ ] Reset all needs to 100%
   - [ ] Set social to 100% (lonely)
   - [ ] Observe happiness need
   - [ ] Verify happiness may be affected

**Success Criteria:**
- [ ] Cleanliness affects health
- [ ] Other interdependencies work as expected
- [ ] No infinite loops or runaway needs

---

### Test 6: Quick Actions ✓

**Objective:** Verify all quick action buttons properly reduce needs

#### Test Each Action:

1. **Feed Pellets**
   - [ ] Set hunger to 50%
   - [ ] Click "Feed Pellets"
   - [ ] Verify hunger decreases (expected: -20 to -30)
   - [ ] Check Activity Feed for feeding message

2. **Feed Vegetables**
   - [ ] Set hunger to 50%
   - [ ] Click "Feed Vegetables"
   - [ ] Verify hunger decreases
   - [ ] Verify different amount than pellets

3. **Give Water**
   - [ ] Set thirst to 50%
   - [ ] Click "Give Water"
   - [ ] Verify thirst decreases (expected: -30 to -40)

4. **Clean**
   - [ ] Set cleanliness to 50%
   - [ ] Click "Clean"
   - [ ] Verify cleanliness decreases (expected: -40 to -50)

5. **Play**
   - [ ] Set happiness to 50%
   - [ ] Click "Play"
   - [ ] Verify happiness decreases
   - [ ] Verify social may decrease

6. **Chew Toy**
   - [ ] Set chew to 50%
   - [ ] Click "Chew Toy"
   - [ ] Verify chew need decreases

7. **Trim Nails**
   - [ ] Set nails to 50%
   - [ ] Click "Trim Nails"
   - [ ] Verify nails need decreases

8. **Soothe to Sleep**
   - [ ] Set energy to 50%
   - [ ] Click "Soothe to Sleep"
   - [ ] Verify energy decreases

**Success Criteria:**
- [ ] All 8 quick actions work
- [ ] Needs decrease by appropriate amounts
- [ ] Activity feed logs actions
- [ ] Friendship may increase slightly

---

### Test 7: Multiple Guinea Pigs ✓

**Objective:** Verify system handles 2 guinea pigs correctly

#### Test Steps:

1. **Start Session with 2 Guinea Pigs**
   - [ ] Ensure both guinea pigs visible in Needs Debug
   - [ ] Verify each has separate need sliders
   - [ ] Verify each has own wellness calculation

2. **Independent Needs**
   - [ ] Set Guinea Pig 1 hunger to 100%
   - [ ] Set Guinea Pig 2 hunger to 0%
   - [ ] Verify they maintain different values
   - [ ] Verify wellness calculations differ

3. **Independent Actions**
   - [ ] Feed Guinea Pig 1
   - [ ] Verify only Guinea Pig 1's hunger changes
   - [ ] Verify Guinea Pig 2 unaffected

4. **Performance Test**
   - [ ] Let both guinea pigs run for 5 minutes
   - [ ] Monitor browser DevTools Performance tab
   - [ ] Verify no lag or slowdown
   - [ ] Verify CPU/memory usage is reasonable

**Success Criteria:**
- [ ] Both guinea pigs display correctly
- [ ] Needs are independent
- [ ] Actions affect only target guinea pig
- [ ] No performance issues

---

### Test 8: System Status Monitoring ✓

**Objective:** Verify System Status panel shows accurate real-time data

#### Test Steps:

1. **Processing Status**
   - [ ] Verify "Processing: Active" when enabled (green)
   - [ ] Verify "Processing: Paused" when paused (red)

2. **Current Wellness**
   - [ ] Change needs and verify wellness updates immediately
   - [ ] Verify value matches guinea pig wellness calculation

3. **Penalty Active**
   - [ ] Set wellness above 45%
   - [ ] Verify "Penalty Active: No" (green)
   - [ ] Set wellness below 45%
   - [ ] Verify "Penalty Active: Yes" (red)

4. **Penalty Rate**
   - [ ] Verify rate changes based on wellness level
   - [ ] Verify matches expected values (-0.5, -0.75, -1.0)

5. **Last Update Timestamp**
   - [ ] Verify updates every tick (~5 seconds)
   - [ ] Verify shows "Just now" or "Xm ago"

6. **Update Interval**
   - [ ] Verify shows "5s" by default
   - [ ] Matches game tick interval

**Success Criteria:**
- [ ] All status fields accurate
- [ ] Updates in real-time
- [ ] Color coding works

---

### Test 9: Extended Session Testing ✓

**Objective:** Check for memory leaks and long-term stability

#### Test Steps:

1. **10-Minute Extended Play**
   - [ ] Start game session with 2 guinea pigs
   - [ ] Enable auto decay (1.0x multiplier)
   - [ ] Let run for 10 minutes
   - [ ] Monitor browser DevTools Memory tab

2. **Check for Memory Leaks**
   - [ ] Take heap snapshot at start
   - [ ] Take heap snapshot at 10 minutes
   - [ ] Compare memory usage
   - [ ] Verify memory is not continuously growing

3. **Performance Degradation Check**
   - [ ] Verify UI remains responsive
   - [ ] Verify no stuttering or lag
   - [ ] Verify tick processing stays consistent
   - [ ] Check console for errors

4. **Data Integrity**
   - [ ] Verify needs values stay within 0-100 range
   - [ ] Verify wellness stays within 0-100 range
   - [ ] Verify no NaN or undefined values
   - [ ] Verify friendship values reasonable

**Success Criteria:**
- [ ] No memory leaks detected
- [ ] Performance stays consistent
- [ ] No errors in console
- [ ] Data stays valid

---

### Test 10: Edge Cases ✓

**Objective:** Test boundary conditions and edge cases

#### Test Steps:

1. **Needs at Maximum (100%)**
   - [ ] Set all needs to 100%
   - [ ] Verify they don't go above 100%
   - [ ] Try quick actions
   - [ ] Verify needs can decrease from 100%

2. **Needs at Minimum (0%)**
   - [ ] Set all needs to 0%
   - [ ] Verify they don't go below 0%
   - [ ] Try quick actions
   - [ ] Verify needs stay at 0% (already satisfied)

3. **Rapid Need Changes**
   - [ ] Rapidly adjust sliders back and forth
   - [ ] Verify wellness updates correctly
   - [ ] Verify no errors occur

4. **Pause During High Activity**
   - [ ] Set all needs to 75% (warning zone)
   - [ ] Pause processing
   - [ ] Verify needs freeze immediately
   - [ ] Resume processing
   - [ ] Verify needs resume correctly

5. **Session End During Low Wellness**
   - [ ] Set wellness to 20% (severe penalty zone)
   - [ ] Navigate to Game Controller tab
   - [ ] Click "Return Guinea Pigs & End Session"
   - [ ] Verify no errors occur
   - [ ] Verify penalty was applied before session end

**Success Criteria:**
- [ ] All edge cases handled gracefully
- [ ] No errors or crashes
- [ ] Bounds enforced (0-100%)
- [ ] State transitions work correctly

---

## Post-Testing Documentation

### After completing all tests:

1. **Update docs/TODO-2025-09-28.md:**
   - [ ] Mark all "Success Criteria" as complete (lines 20-54)
   - [ ] Mark "Phase 5: UI Integration" as complete (lines 40-45)
   - [ ] Mark "Testing & Validation" items as complete (lines 56-81)

2. **Document Test Results:**
   - [ ] Note any bugs found
   - [ ] Record performance metrics
   - [ ] Document any deviations from expected behavior

3. **Create Bug Reports:**
   - [ ] If bugs found, add to TODO as new issues
   - [ ] Prioritize fixes

4. **Update System Documentation:**
   - [ ] Mark System 8 (Needs Controller) as ✅ VALIDATED
   - [ ] Update PROJECT_PLAN.md
   - [ ] Update DEVELOPMENT_PHASES.md

---

## Summary Checklist

- [ ] Test 1: System Controls ✓
- [ ] Test 2: Wellness Calculation ✓
- [ ] Test 3: Friendship Penalties ✓
- [ ] Test 4: Natural Needs Decay ✓
- [ ] Test 5: Need Interdependencies ✓
- [ ] Test 6: Quick Actions ✓
- [ ] Test 7: Multiple Guinea Pigs ✓
- [ ] Test 8: System Status Monitoring ✓
- [ ] Test 9: Extended Session Testing ✓
- [ ] Test 10: Edge Cases ✓
- [ ] Documentation Updated

---

## Success Criteria from TODO

After completing all tests, you should be able to confirm:

✅ **System 8 Success Criteria:**
- [ ] All 10 needs decay at appropriate rates
- [ ] Health impacts other needs when low (cleanliness → health)
- [ ] Interdependencies work correctly
- [ ] Critical thresholds (>75%) trigger warnings
- [ ] Needs decay naturally over time without intervention
- [ ] Wellness calculation accurate and visible
- [ ] Friendship penalties apply correctly based on wellness
- [ ] System performs well with 2 guinea pigs
- [ ] No memory leaks during extended sessions
- [ ] Debug panel fully functional

---

## Estimated Testing Time

- **Quick Smoke Test:** 15-20 minutes
- **Comprehensive Testing:** 2-3 hours
- **Extended Testing (including 10-min session):** 3-4 hours

---

**Next Steps After Testing:**
1. Document all test results
2. Fix any bugs found
3. Update TODO-2025-09-28.md to mark Priority 1 complete
4. Move on to Priority 3 (Game Timing System Validation)

**Good luck with testing!** 🎮🍎
