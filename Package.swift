// swift-tools-version:5.10
import PackageDescription

let package = Package(
    name: "CurioContracts",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "CurioContracts", targets: ["CurioContracts"])
    ],
    targets: [
        .target(name: "CurioContracts", path: "Sources/CurioContracts"),
        // The Swift half of decisions/0027 shipped unimplemented for three days because this
        // package was generated and committed but never COMPILED, let alone run. Kotlin had a
        // gradle target in CI; Swift had neither.
        .testTarget(name: "CurioContractsTests", dependencies: ["CurioContracts"], path: "Tests/CurioContractsTests")
    ]
)
