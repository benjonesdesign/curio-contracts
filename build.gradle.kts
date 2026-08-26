// Pure-Kotlin (kotlin("jvm"), not an Android Library module) build for the generated contracts —
// there is nothing Android-specific in APITypes.kt/DBTypes.kt (plain data classes +
// kotlinx.serialization), and a JVM library is directly consumable from an Android app's Gradle
// build with no Android SDK required to BUILD this module itself. That keeps JitPack's build step
// (which is what Android pins a version through, mirroring how web pins an npm git-URL dependency
// and iOS pins a SwiftPM git tag — see README.md "Consuming this package") to just a JDK, no
// Android SDK/licenses to provision.
//
// Kotlin sources live under src/main/kotlin (standard Gradle/Kotlin convention) — a sibling of
// this repo's src/api and src/db (TypeScript), not a subpath of them, so the two toolchains'
// source trees never collide.
plugins {
    kotlin("jvm") version "2.0.20"
    kotlin("plugin.serialization") version "2.0.20"
    `maven-publish`
}

group = "com.github.benjonesdesign"
// JitPack overrides this with the git tag being built (e.g. v0.1.21) — the literal value here
// only matters for a local `./gradlew publishToMavenLocal` during development.
version = "0.0.0-local"

repositories {
    mavenCentral()
}

kotlin {
    // Targets bytecode compatible with Android's minimum supported JVM level without requiring a
    // specific JDK toolchain to be locally installed to BUILD this module (jvmToolchain(N) needs
    // an exact matching JDK auto-detected/downloadable, which isn't guaranteed on every CI/JitPack
    // image) — compiles fine on any JDK 11+, targets JVM 11 bytecode either way. The kotlin("jvm")
    // plugin auto-applies the `java` plugin too, whose own compileJava task defaults to the
    // current JDK's version — pinned to match, or Gradle fails the build on the mismatch.
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_11)
    }
}

java {
    sourceCompatibility = JavaVersion.VERSION_11
    targetCompatibility = JavaVersion.VERSION_11
}


dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    testImplementation(kotlin("test"))
}

tasks.test {
    useJUnitPlatform()
}

publishing {
    publications {
        create<MavenPublication>("maven") {
            from(components["java"])
        }
    }
}
