// swift-tools-version:5.10
import PackageDescription

let package = Package(
    name: "CurioContracts",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "CurioContracts", targets: ["CurioContracts"])
    ],
    targets: [
        .target(name: "CurioContracts", path: "Sources/CurioContracts")
    ]
)
