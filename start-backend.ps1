$env:JAVA_HOME = 'C:\Program Files\Java\jdk-25'
$env:Path = "$env:JAVA_HOME\bin;C:\tmp\apache-maven-3.9.9\bin;$env:Path"

# Load local environment variables from .env if it exists
if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $key, $val = $line -split '=', 2
            if ($key -and $val) {
                $env:$($key.Trim()) = $val.Trim()
            }
        }
    }
}

cd "C:\Users\deves\Desktop\LinkdinApplyAgent\System Design Studio\sysdesign-api"
mvn spring-boot:run "-Dspring-boot.run.jvmArguments=-Dspring.profiles.active=local"
