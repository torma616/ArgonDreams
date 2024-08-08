(() => {
  'use strict'
  /*
  * targetElements:
  * '.argonAll' = all
  * '.argonBrackets' = brackets (.monaco-editor .bracket-highlighting-[0-29])
  * '.mtk[1 - 22]', 'mtki', 'mtkb', 'mtku', 'mtks', 'mtks.mtku'
  */

  const dreamArgonDreams = () => {
    let argonBrightness = 20; //* 0 - 100%
    let argonGlow = 80; //* 0 - 100%

    const targetElements = [];
    const updateCSS = (obj) => {
      const cssRules = Object.entries(obj)
        .filter(([cls]) => {
          if (targetElements.length === 1 && targetElements.includes('.argonAll')) return cls
          else if (cls.includes('_.bracket-highlighting-') && targetElements.includes('.argonBrackets')) return Object.keys(obj).some(key => key.includes('_.bracket-highlighting-'));
          else return targetElements.includes(cls)
        })
        .map(([cls, property]) => {
          let valuesArray;
          if (typeof property === 'object' && !Array.isArray(property)) valuesArray = ['originalColor', 'color', 'textShadow'].map(cls => property[cls]).filter(value => value !== undefined);
          else valuesArray = property;
          return `${cls.match(/\*CUSTOM\*/)
            ? targetElements.includes('.argonBrackets')
              ? cls.replace(/\*CUSTOM\*/, '').replace(/\_/, ' ') : `${cls.replace(/\*CUSTOM\*/, '').replace(/\_/, ' ')}:not([class*="bracket-highlighting"])`
            : cls.replace(/\_/, ' ')} { ${valuesArray.length === 1 ? valuesArray[0] : `\n\t/*color: ${valuesArray[0]};*/\n\tcolor: ${valuesArray[1]};\n\ttext-shadow: ${valuesArray[2]}`}; \n } \n`
        }).filter(Boolean).join('\n')

      const customCSS = document.querySelector('style.argon-dreams');
      if (customCSS) customCSS.remove();
      const style = document.createElement('style');
      style.classList.add('argon-dreams')
      style.innerHTML = cssRules;
      document.body.insertBefore(style, document.querySelector('div.monaco-workbench'))
    }

    const adjustColor = (r, g, b, factor) => ({
      r: Math.min(Math.round(r + (255 - r) * factor), 255),
      g: Math.min(Math.round(g + (255 - g) * factor), 255),
      b: Math.min(Math.round(b + (255 - b) * factor), 255)
    });

    const calculateOpacity = (r, g, b) => {
      const luminance = 0.2126 * ((r / 255 <= 0.03928) ? (r / 255 / 12.92) : Math.pow((r / 255 + 0.055) / 1.055, 2.4)) +
        0.7152 * ((g / 255 <= 0.03928) ? (g / 255 / 12.92) : Math.pow((g / 255 + 0.055) / 1.055, 2.4)) +
        0.0722 * ((b / 255 <= 0.03928) ? (b / 255 / 12.92) : Math.pow((b / 255 + 0.055) / 1.055, 2.4));
      const getScaleFromLuminance = (luminance) => 1 + (luminance * (2 - 1));
      const scale = getScaleFromLuminance(luminance);
      return Math.max(0.1, Math.min(1, scale - (luminance * scale)));
    };

    const createGlow = (color) => {
      if (!color.startsWith('rgb')) return color
      const [r, g, b, a = null] = color.match(/\d*\.?\d+/g).map(Number);
      const opacity = calculateOpacity(r, g, b)
      const scale = argonBrightness / 100;
      const adjustedColor = adjustColor(
        ...Object.values(adjustColor(r, g, b, scale)),
        scale / 2
      );

      const interpolateValues = (num) => {
        const startArr = [0, 0, 0, 0, 0];
        const endArr = [2, 3, 5, 9, 15];
        num = Math.max(0, Math.min(1, num));
        const t = num;
        const interpolatedArr = startArr.map((startVal, index) => {
          const endVal = endArr[index];
          if (startVal === 0 && endVal === 0) return 0;
          if (startVal === 0) return endVal * t;
          const logStart = Math.log(startVal + 1);
          const logEnd = Math.log(endVal + 1);
          const logInterpolated = logStart + t * (logEnd - logStart);

          return Math.exp(logInterpolated) - 1; // Subtracting 1 to undo the offset added before
        });

        return interpolatedArr;
      }
      const glow = argonGlow / 100;
      const colorString = `rgba(${adjustedColor.r}, ${adjustedColor.g}, ${adjustedColor.b}, 0.9)`;
      const primaryShadowColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
      const secondaryShadowColor = `rgba(${r}, ${g}, ${b}, ${opacity / 2})`;
      const blackShadowColor = 'rgba(0, 0, 0, 0.8)';
      const shadowString = `0 0 ${interpolateValues(glow)[0]}px ${blackShadowColor},\n\t\t0 0 ${interpolateValues(glow)[1]}px ${primaryShadowColor},\n\t\t0 0 ${interpolateValues(glow)[2]}px ${secondaryShadowColor},\n\t\t0 0 ${interpolateValues(glow)[3]}px ${primaryShadowColor},\n\t\t0 0 ${interpolateValues(glow)[4]}px ${secondaryShadowColor}`;
      // const shadowString = `0 0 1px ${blackShadowColor}, 0 0 2px ${primaryShadowColor}, 0 0 4px ${secondaryShadowColor}, 0 0 6px ${primaryShadowColor}, 0 0 8px ${secondaryShadowColor}`;
      return {
        originalColor: color,
        color: colorString,
        textShadow: shadowString
      }
    }

    const processColors = (obj) => {
      const colors = Object.fromEntries(Object.entries(obj).map(([cls, colors]) => [cls, createGlow(colors)]))
      updateCSS(colors)
    }

    const init = () => {
      const cssRuleset = {}
      const checkCustomCss = () => {
        Array.from(document.styleSheets).forEach(sheet => {
          const cssElem = sheet.ownerNode;
          if (cssElem && cssElem.tagName === 'STYLE' && cssElem.parentNode.tagName === 'BODY' && !cssElem.classList.contains('argon-dreams'))
            Array.from(sheet.cssRules).forEach(rule => {
              if (rule.style.getPropertyValue('--argon-dreams') === 'true')
                rule.selectorText.split(', ').forEach(cls => {
                  if (!targetElements.includes(cls.replace(/\s/, '_'))) targetElements.push(cls.replace(/\s/, '_'))
                  const colorString = rule.cssText.match(/rgb\(.+\)/g);
                  if (colorString) {
                    if (!targetElements.includes(`*CUSTOM*${cls.replace(/\s/, '_')}`)) targetElements.push(`*CUSTOM*${cls.replace(/\s/, '_')}`)
                    if (targetElements.includes(cls.replace(/\s/, '_'))) targetElements.splice(targetElements.indexOf(cls.replace(/\s/, '_')), 1)
                    cssRuleset[`*CUSTOM*${cls.replace(/\s/, '_')}`] = colorString[0]
                  }
                })
              if (rule.style.getPropertyValue('--argonBrightness')) argonBrightness = rule.style.getPropertyValue('--argonBrightness').replace(/\%/, '');
              if (rule.style.getPropertyValue('--argonGlow')) argonGlow = rule.style.getPropertyValue('--argonGlow').replace(/\%/, '');
            }
            );
        });
      }

      const getStyles = (elem) => {
        const mtkRe = /mtk(?:\d{1,2}|i|b|u|s)/
        const bracketRe = /bracket-highlighting-\d{1,2}/
        const stylesheet = Array.from(document.styleSheets).find(sheet => sheet.ownerNode === elem);
        if (stylesheet) {
          Array.from(stylesheet.cssRules).forEach(({ selectorText, style, cssText }) => {
            if (selectorText && (mtkRe.test(selectorText) || bracketRe.test(selectorText))) {
              if (style.length === 1 && style[0] === 'color') cssRuleset[selectorText.replace(/\s/, '_')] = cssText.match(/^.+ color: ((#|rgba?)(.+));.+$/)[1]
              else cssRuleset[selectorText.replace(/\s/, '_')] = cssText.match(/.+{\s*(.+)\s}$/)[1];
              checkCustomCss();
              processColors(cssRuleset);
            }
          });
        }
      }

      const watchStyles = (watchingFor = null) => new MutationObserver((mutations, observer) => mutations.forEach(mutation => {
        const { target, type, addedNodes } = mutation;
        if (type === 'childList' && target.tagName === 'STYLE' && (watchingFor ? target.classList.contains(watchingFor) : true)) {
          if (target._discovered !== true && !target.classList.contains('argon-dreams')) {
            target._discovered = true;
            getStyles(target)
            observer.observe(target, { childList: true })
          } else if (addedNodes.length > 0 && target._discovered === true && !target.classList.contains('argon-dreams'))
            addedNodes.forEach(node => node.nodeType === Node.TEXT_NODE && getStyles(target));
        }
      })).observe(document, { childList: true, subtree: true });

      (() => {
        checkCustomCss();
        watchStyles();
      })();
    }
    init();
  }
  dreamArgonDreams();
})();
