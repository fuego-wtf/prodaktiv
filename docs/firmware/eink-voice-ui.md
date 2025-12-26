# E-Ink Voice UI Design Specification

**Task**: FCS-411
**Display**: 200x200 pixels, 1-bit (black/white)
**Target Device**: Lin34r Focus Timer Hardware

---

## Display Constraints

| Parameter | Value | Notes |
|-----------|-------|-------|
| Resolution | 200x200 px | Square aspect ratio |
| Color Depth | 1-bit | Black (#000) and White (#FFF) only |
| Partial Refresh | ~300ms | Use for state transitions |
| Full Refresh | ~2s | Use sparingly, clears ghosting |
| Ghosting | Moderate | Full refresh every 10-15 partial updates |

---

## Voice State Screens

### State A: IDLE (Default Timer View)

```
+--------------------+
|      FOCUS         |    <- 16px font, centered
|                    |
|       45:30        |    <- 48px font, primary display
|                    |
|    Session 2/4     |    <- 12px font, secondary info
|   [ Push to talk ] |    <- 10px font, hint text
+--------------------+
     200px width
```

**Layout Specifications**:
- Header "FOCUS": Y=20, centered, bold
- Timer digits: Y=80-120, centered, large font
- Session counter: Y=150, centered
- Hint text: Y=180, centered, light/gray simulation via dithering

**Refresh Strategy**: Partial refresh for timer countdown (every second or every 10s)

---

### State B: RECORDING (Voice Capture Active)

```
+--------------------+
|   [M] RECORDING    |    <- [M] = microphone icon
|                    |
|                    |
|    o  o  o  o  o   |    <- 5 dots for waveform
|                    |
| [ Release to end ] |
+--------------------+
```

**Layout Specifications**:
- Header: Y=25, "[M] RECORDING" with microphone glyph
- Waveform area: Y=90-110, 5 circular dots (10px diameter each)
- Dots spacing: 30px apart, centered horizontally
- Instruction: Y=175, centered

**Waveform Visualization** (E-Ink Compatible):
```
Silence:    o  o  o  o  o     (all small, 8px)
Low:        o  O  o  O  o     (alternating 8px/12px)
Medium:     O  o  O  o  O     (alternating 12px/8px)
High:       O  O  O  O  O     (all large, 12px)
Peak:       @  @  @  @  @     (filled circles, 12px)
```

**Refresh Strategy**: Partial refresh every 300ms to update waveform dots

---

### State C: PROCESSING (STT Running)

```
+--------------------+
|                    |
|   PROCESSING...    |    <- 14px font, centered
|                    |
|        [S]         |    <- Spinner frame (see below)
|                    |
|    Please wait     |    <- 10px font
+--------------------+
```

**Layout Specifications**:
- Status text: Y=60, centered
- Spinner area: Y=90-130, centered, 40x40px bounding box
- Wait message: Y=170, centered

**E-Ink Spinner Frames** (4-frame cycle, partial refresh):
```
Frame 1:     Frame 2:     Frame 3:     Frame 4:
   |            /            -            \
   |            /            -            \

ASCII Representation:
  [|]          [/]          [-]          [\]
```

Actual pixel art (20x20 each):
```
Frame 1:        Frame 2:        Frame 3:        Frame 4:
    ##              ##          ########            ##
    ##            ##                              ##
    ##          ##                                  ##
    ##        ##            ########                  ##
    ##          ##                                  ##
    ##            ##                              ##
    ##              ##                            ##
```

**Refresh Strategy**:
- Partial refresh every 400ms for spinner animation
- Limit to 8-10 frames total, then hold on final frame
- If processing exceeds 4 seconds, show static "..." instead

---

### State D: SUCCESS (Task Created)

```
+--------------------+
|                    |
|   [V] TASK ADDED   |    <- [V] = checkmark icon
|                    |
|      FCS-428       |    <- Task ID, 18px bold
|                    |
|  Check desktop     |
|   for details      |
+--------------------+
```

**Layout Specifications**:
- Success header: Y=50, with checkmark glyph
- Task ID: Y=100, centered, bold, larger font
- Instructions: Y=150-170, two lines, centered

**Refresh Strategy**:
- Single partial refresh to show success
- Hold for 3 seconds
- Full refresh when returning to IDLE (clears any ghosting)

---

### State E: ERROR (Optional - Task Failed)

```
+--------------------+
|                    |
|   [X] ERROR        |    <- [X] = X mark icon
|                    |
|   Could not        |
|   create task      |
|                    |
|   Try again        |
+--------------------+
```

**Refresh Strategy**: Partial refresh, hold 3 seconds, return to IDLE

---

## State Transition Diagram

```
                    +--------+
                    | IDLE   |<-----------------+
                    +--------+                  |
                        |                       |
                  [Button Press]                |
                        |                       |
                        v                       |
                   +-----------+                |
                   | RECORDING |                |
                   +-----------+                |
                        |                       |
                 [Button Release]               |
                        |                       |
                        v                       |
                  +------------+                |
                  | PROCESSING |                |
                  +------------+                |
                        |                       |
              +---------+---------+             |
              |                   |             |
         [Success]            [Error]           |
              |                   |             |
              v                   v             |
         +---------+         +---------+        |
         | SUCCESS |         |  ERROR  |        |
         +---------+         +---------+        |
              |                   |             |
              +-------------------+-------------+
                    [3s timeout]
```

---

## Transition Timing

| Transition | Duration | Refresh Type | Notes |
|------------|----------|--------------|-------|
| IDLE -> RECORDING | 300ms | Partial | Immediate feedback |
| RECORDING waveform | 300ms | Partial | Update dots only |
| RECORDING -> PROCESSING | 300ms | Partial | Clear waveform |
| PROCESSING spinner | 400ms | Partial | 4-frame cycle |
| PROCESSING -> SUCCESS | 300ms | Partial | Show result |
| PROCESSING -> ERROR | 300ms | Partial | Show error |
| SUCCESS -> IDLE | 500ms | Full | Clear ghosting |
| ERROR -> IDLE | 500ms | Full | Clear ghosting |

**Full Refresh Schedule**:
- After every SUCCESS/ERROR state
- Every 15 partial updates during extended RECORDING
- On device wake from sleep
- Manual trigger via button combo (long press both buttons)

---

## Icon/Glyph Designs (1-bit Compatible)

All icons designed for 16x16 pixel grid, 1-bit depth.

### Microphone Icon [M]
```
      ####
     ######
     ######
     ######
      ####
       ##
     ######
     ######
```

### Checkmark Icon [V]
```
            ##
          ####
        ####
  ##  ####
  ######
  ####
  ##
```

### X Mark Icon [X]
```
  ##        ##
  ####    ####
    ########
      ####
    ########
  ####    ####
  ##        ##
```

### Spinner Frames [S]
```
Frame 1 (|)    Frame 2 (/)    Frame 3 (-)    Frame 4 (\)
    ####           ##         ##########         ##
    ####          ##                            ##
    ####         ##                            ##
    ####        ##          ##########        ##
    ####         ##                            ##
    ####          ##                            ##
    ####           ##                         ##
```

### Recording Dot (filled)
```
    ####
  ########
  ########
  ########
    ####
```

### Recording Dot (hollow)
```
    ####
  ##    ##
  ##    ##
  ##    ##
    ####
```

---

## Font Recommendations

| Usage | Size | Style | Notes |
|-------|------|-------|-------|
| Timer digits | 48px | Bold, monospace | Clear readability |
| Headers | 16px | Bold | State identification |
| Status text | 14px | Regular | Secondary info |
| Hints | 10px | Light/dithered | Tertiary info |

**Recommended Fonts** (bitmap-optimized):
- **Primary**: Terminus (excellent at small sizes)
- **Alternative**: Droid Sans Mono, Roboto Mono
- **Fallback**: System bitmap font

---

## Implementation Notes

### Memory Buffer Strategy
```
+------------------+
| Frame Buffer A   |  <- Currently displayed
+------------------+
| Frame Buffer B   |  <- Next state prepared
+------------------+
| Diff Region      |  <- Only changed pixels
+------------------+
```

1. Prepare next state in Buffer B
2. Calculate diff region (bounding box of changes)
3. Partial refresh only the diff region
4. Swap buffer pointers

### Ghosting Mitigation
- Track partial refresh count per session
- Force full refresh at threshold (15 partials)
- Always full refresh on state exit to IDLE
- Consider "flash" technique: invert -> normal -> display

### Power Considerations
- E-Ink maintains image with zero power
- Only draw power during refresh
- Batch updates when possible
- Sleep display controller between states

---

## Testing Checklist

- [ ] All states render correctly at 200x200
- [ ] Icons visible and recognizable at target size
- [ ] Timer digits readable from 30cm distance
- [ ] Partial refresh produces acceptable contrast
- [ ] Full refresh clears all ghosting
- [ ] Transition timing feels responsive
- [ ] Spinner animation not too fast for E-Ink
- [ ] SUCCESS state holds long enough to read task ID
- [ ] ERROR state provides clear feedback

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-12-26 | Initial design specification |
