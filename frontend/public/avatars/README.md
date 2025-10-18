# Avatar Assets

This directory contains fitness-themed avatar images for user profiles.

## Avatar List

We're using a hybrid approach:
1. **DiceBear API** for initial implementation (free, no download needed)
2. **Custom SVGs** can be added here later for offline support

## Available Avatars

### Strength Category
- `weightlifter-male` - Male weightlifter
- `weightlifter-female` - Female weightlifter  
- `bodybuilder-male` - Male bodybuilder
- `bodybuilder-female` - Female bodybuilder

### Cardio Category
- `runner-male` - Male runner
- `runner-female` - Female runner
- `cyclist-male` - Male cyclist
- `cyclist-female` - Female cyclist

### Flexibility Category
- `yogi-male` - Male yogi
- `yogi-female` - Female yogi

### Agility Category
- `gymnast-male` - Male gymnast
- `gymnast-female` - Female gymnast

### Combat Category
- `boxer-male` - Male boxer
- `boxer-female` - Female boxer

### General Category
- `athlete-male` - Male athlete
- `athlete-female` - Female athlete

## Usage

Avatars are served via DiceBear API initially:
```
https://api.dicebear.com/7.x/avataaars/svg?seed={avatar-id}
```

For offline/custom avatars, place SVG files here with matching names:
```
/avatars/weightlifter-male.svg
/avatars/runner-female.svg
etc.
```

## Future Enhancements

- Add custom fitness-themed SVG illustrations
- Add animated avatars
- Add premium/unlockable avatars
- Add seasonal/event avatars
