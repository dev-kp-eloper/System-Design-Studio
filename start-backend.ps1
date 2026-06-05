$env:JAVA_HOME = 'C:\Program Files\Java\jdk-25'
$env:Path = "$env:JAVA_HOME\bin;C:\tmp\apache-maven-3.9.9\bin;$env:Path"

cd "C:\Users\deves\Desktop\LinkdinApplyAgent\System Design Studio\sysdesign-api"
mvn spring-boot:run "-Dspring-boot.run.jvmArguments=-Dspring.profiles.active=local"
