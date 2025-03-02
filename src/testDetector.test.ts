import { detectKotlinTests } from './testDetector';

describe('Kotlin Test Detector', () => {
    test('should detect JUnit test class', () => {
        const kotlinCode = `
            package com.example

            import org.junit.Test
            import org.junit.Assert.*

            class CalculatorTest {
                @Test
                fun testAddition() {
                    assertEquals(4, 2 + 2)
                }

                @Test
                fun testSubtraction() {
                    assertEquals(0, 2 - 2)
                }
            }
        `;

        const tests = detectKotlinTests(kotlinCode);
        
        expect(tests).toEqual([
            {
                name: 'testAddition',
                range: expect.any(Object),
                className: 'CalculatorTest'
            },
            {
                name: 'testSubtraction',
                range: expect.any(Object),
                className: 'CalculatorTest'
            }
        ]);
    });

    test('should detect test class with different annotations', () => {
        const kotlinCode = `
            package com.example

            import org.junit.jupiter.api.Test
            import kotlin.test.Test

            class MultipleTest {
                @org.junit.jupiter.api.Test
                fun jupiterTest() {}

                @kotlin.test.Test
                fun kotlinTest() {}
            }
        `;

        const tests = detectKotlinTests(kotlinCode);
        
        expect(tests).toEqual([
            {
                name: 'jupiterTest',
                range: expect.any(Object),
                className: 'MultipleTest'
            },
            {
                name: 'kotlinTest',
                range: expect.any(Object),
                className: 'MultipleTest'
            }
        ]);
    });
});
